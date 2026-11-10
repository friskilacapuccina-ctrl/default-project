import { AppShell } from "@/components/layout/AppShell";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ClipboardCheck } from "lucide-react";

export default function PretestPage() {
  return (
    <AppShell allow={["STUDENT"]}>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-200 text-sage-800 shadow-sm dark:bg-[#294833] dark:text-[#c5dda6]">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-sage-700 dark:text-[#b8d596]">Sebelum mulai belajar</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-[#edf4e2] md:text-3xl">Kenali Pemahaman Awalmu</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#aab9a7]">Pemetaan singkat untuk mengetahui titik awal perjalanan belajarmu.</p>
        </div>
      </div>
      <QuizRunner kind="pretest" />
    </AppShell>
  );
}
