import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { shuffle } from "@/lib/utils";

/** Ambil soal posttest (tanpa jawaban benar — penilaian di server). */
export async function GET() {
  const auth = await requireApi(["STUDENT"]);
  if (auth.response) return auth.response;
  const posttest = await db.posttest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" }, include: { questions: { orderBy: { order: "asc" }, include: { options: true } } } });
  if (!posttest) return NextResponse.json({ assessmentId: null, questions: [] });
  const questions = shuffle(posttest.questions).map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: shuffle(q.options.map((o) => ({ id: o.id, optionText: o.optionText }))),
  }));
  return NextResponse.json({ assessmentId: posttest.id, questions });
}
