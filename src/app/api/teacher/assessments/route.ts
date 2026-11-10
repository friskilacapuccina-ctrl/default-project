import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const questionSchema = z.object({
  questionText: z.string().trim().min(10).max(3000),
  explanation: z.string().trim().max(3000).default(""),
  options: z.array(z.object({ text: z.string().trim().min(1).max(500), isCorrect: z.boolean() })).length(4),
});

const saveSchema = z.object({
  kind: z.enum(["PRETEST", "POSTTEST"]),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1000).default(""),
  questions: z.array(questionSchema).min(1).max(100),
}).superRefine((assessment, context) => {
  assessment.questions.forEach((question, index) => {
    if (question.options.filter((option) => option.isCorrect).length !== 1) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["questions", index, "options"], message: "Tandai tepat satu jawaban benar." });
    }
  });
});

/** Ambil bank soal aktif untuk pengelola tes Guru. */
export async function GET() {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;

  const [pretest, posttest] = await Promise.all([
    db.pretest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" }, include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { optionText: "asc" } } } } } }),
    db.posttest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" }, include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { optionText: "asc" } } } } } }),
  ]);

  return NextResponse.json({
    pretest: pretest ? { id: pretest.id, title: pretest.title, description: pretest.description ?? "", questions: pretest.questions.map((question) => ({ id: question.id, questionText: question.questionText, explanation: question.explanation ?? "", options: question.options.map((option) => ({ id: option.id, text: option.optionText, isCorrect: option.isCorrect })) })) } : null,
    posttest: posttest ? { id: posttest.id, title: posttest.title, description: posttest.description ?? "", questions: posttest.questions.map((question) => ({ id: question.id, questionText: question.questionText, explanation: question.explanation ?? "", options: question.options.map((option) => ({ id: option.id, text: option.optionText, isCorrect: option.isCorrect })) })) } : null,
  });
}

/** Simpan perubahan sebagai versi baru agar hasil tes lama tetap utuh. */
export async function POST(request: Request) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pastikan soal terisi dan setiap soal memiliki tepat satu jawaban benar." }, { status: 400 });

  const data = parsed.data;
  const saved = await db.$transaction(async (transaction) => {
    if (data.kind === "PRETEST") {
      const active = await transaction.pretest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" } });
      if (active) await transaction.pretest.update({ where: { id: active.id }, data: { published: false } });
      return transaction.pretest.create({
        data: {
          title: data.title,
          description: data.description,
          published: true,
          questions: { create: data.questions.map((question, index) => ({ questionText: question.questionText, explanation: question.explanation, order: index + 1, points: 4, options: { create: question.options.map((option) => ({ optionText: option.text, isCorrect: option.isCorrect })) } })) },
        },
        select: { id: true },
      });
    }

    const active = await transaction.posttest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" } });
    if (active) await transaction.posttest.update({ where: { id: active.id }, data: { published: false } });
    return transaction.posttest.create({
      data: {
        title: data.title,
        description: data.description,
        published: true,
        questions: { create: data.questions.map((question, index) => ({ questionText: question.questionText, explanation: question.explanation, order: index + 1, points: 4, options: { create: question.options.map((option) => ({ optionText: option.text, isCorrect: option.isCorrect })) } })) },
      },
      select: { id: true },
    });
  });

  await writeAuditLog({ actorId: auth.user.id, action: "ASSESSMENT_VERSION_CREATE", targetType: data.kind, targetId: saved.id, detail: { questionCount: data.questions.length } });
  return NextResponse.json({ ok: true, id: saved.id, questionCount: data.questions.length });
}

/** Hapus tes aktif dari siswa dengan mengarsipkan versinya, bukan menghapus hasil lama. */
export async function DELETE(request: Request) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;
  const body = z.object({ kind: z.enum(["PRETEST", "POSTTEST"]) }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Jenis tes tidak valid." }, { status: 400 });

  const { kind } = body.data;
  const archived = await db.$transaction(async (transaction) => {
    if (kind === "PRETEST") {
      const active = await transaction.pretest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" } });
      if (!active) return null;
      return transaction.pretest.update({ where: { id: active.id }, data: { published: false }, select: { id: true } });
    }
    const active = await transaction.posttest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" } });
    if (!active) return null;
    return transaction.posttest.update({ where: { id: active.id }, data: { published: false }, select: { id: true } });
  });
  if (!archived) return NextResponse.json({ error: "Tes tersebut sudah tidak aktif." }, { status: 404 });

  await writeAuditLog({ actorId: auth.user.id, action: "ASSESSMENT_ARCHIVE", targetType: kind, targetId: archived.id });
  return NextResponse.json({ ok: true });
}
