import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { submitQuizSchema } from "@/lib/validations";
import { scoreFromCounts } from "@/lib/utils";

/**
 * Submit pretest. Penilaian sepenuhnya di server (jawaban benar tidak pernah
 * dikirim ke klien); kepemilikan attempt diambil dari sesi, bukan body.
 */
export async function POST(req: Request) {
  const auth = await requireApi(["STUDENT"]);
  if (auth.response) return auth.response;
  const body = await req.json();
  const parsed = submitQuizSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data jawaban tidak valid" }, { status: 400 });

  const pretest = await db.pretest.findFirst({ where: { id: parsed.data.assessmentId, published: true }, include: { questions: { include: { options: true } } } });
  if (!pretest) return NextResponse.json({ error: "Pretest belum tersedia" }, { status: 404 });
  const total = pretest.questions.length;
  if (!total) return NextResponse.json({ error: "Pretest belum memiliki soal" }, { status: 400 });
  const correctByQ = new Map(pretest.questions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id]));
  const optionsByQ = new Map(pretest.questions.map((q) => [q.id, new Set(q.options.map((option) => option.id))]));
  const answeredIds = parsed.data.answers.map((answer) => answer.questionId);
  if (answeredIds.length !== total) {
    return NextResponse.json({ error: "Semua soal harus dijawab sebelum dikirim." }, { status: 400 });
  }
  if (new Set(answeredIds).size !== answeredIds.length || parsed.data.answers.some((answer) => !optionsByQ.get(answer.questionId)?.has(answer.selectedOptionId))) {
    return NextResponse.json({ error: "Jawaban tidak sesuai dengan versi pretest ini" }, { status: 400 });
  }

  let correct = 0;
  const rows = parsed.data.answers.map((a) => {
    const isCorrect = correctByQ.get(a.questionId) === a.selectedOptionId;
    if (isCorrect) correct++;
    return { questionId: a.questionId, selectedOptionId: a.selectedOptionId, isCorrect };
  });
  const score = scoreFromCounts(correct, total);

  const attempt = await db.pretestAttempt.create({
    data: {
      userId: auth.user.id, pretestId: pretest.id, score, correctCount: correct,
      wrongCount: total - correct, percentage: score,
      startedAt: parsed.data.startedAt ? new Date(parsed.data.startedAt) : new Date(),
      answers: { create: rows },
    },
  });

  const selectedByQuestion = new Map(parsed.data.answers.map((answer) => [answer.questionId, answer.selectedOptionId]));
  const review = pretest.questions.map((question) => {
    const selectedOptionId = selectedByQuestion.get(question.id);
    const selectedOption = question.options.find((option) => option.id === selectedOptionId);
    const correctOption = question.options.find((option) => option.isCorrect);
    return {
      questionId: question.id,
      questionText: question.questionText,
      selectedAnswer: selectedOption?.optionText ?? "",
      correctAnswer: correctOption?.optionText ?? "",
      isCorrect: selectedOptionId === correctOption?.id,
      explanation: question.explanation ?? "",
    };
  });

  return NextResponse.json({ id: attempt.id, score, correctCount: correct, wrongCount: total - correct, review });
}
