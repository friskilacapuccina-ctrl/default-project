import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClipboardCheck } from "lucide-react";
import { AssessmentManager, type AssessmentData } from "./AssessmentManager";

type DatabaseAssessment = {
  id: string;
  title: string;
  description: string | null;
  questions: Array<{
    id: string;
    questionText: string;
    explanation: string | null;
    options: Array<{ id: string; optionText: string; isCorrect: boolean }>;
  }>;
};

export default async function TeacherAssessmentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") return null;

  const [pretest, posttest] = await Promise.all([
    db.pretest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" }, include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { optionText: "asc" } } } } } }),
    db.posttest.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" }, include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { optionText: "asc" } } } } } }),
  ]);

  const toAssessment = (test: DatabaseAssessment, kind: "PRETEST" | "POSTTEST"): AssessmentData => ({
    id: test.id,
    kind,
    title: test.title,
    description: test.description ?? "",
    questions: test.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      explanation: question.explanation ?? "",
      options: question.options.map((option) => ({ id: option.id, text: option.optionText, isCorrect: option.isCorrect })),
    })),
  });

  const assessments = [
    pretest ? toAssessment(pretest, "PRETEST") : { id: "", kind: "PRETEST" as const, title: "Pretest Biologi SMA", description: "Tes diagnostik sebelum belajar.", questions: [] },
    posttest ? toAssessment(posttest, "POSTTEST") : { id: "", kind: "POSTTEST" as const, title: "Posttest Biologi SMA", description: "Evaluasi setelah belajar.", questions: [] },
  ];

  return (
    <AppShell allow={["TEACHER"]}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-semibold text-sage-700">Ruang Guru</p>
          <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900"><ClipboardCheck className="h-8 w-8 text-sage-600" />Kelola Pretest & Posttest</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Tambah, edit, dan hapus soal pilihan ganda. Setiap soal harus memiliki empat pilihan dan satu jawaban benar.</p>
        </header>
        <AssessmentManager initialAssessments={assessments} />
      </div>
    </AppShell>
  );
}
