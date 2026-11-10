import { AppShell } from "@/components/layout/AppShell";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { TrendingUp } from "lucide-react";

export default function PosttestPage() {
  return (
    <AppShell allow={["STUDENT"]}>
      <div className="animate-in fade-in duration-500">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-700 text-white shadow-md shadow-sage-900/15 dark:bg-[#315d3d]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-sage-700 dark:text-[#b8d596]">Setelah menyelesaikan materi</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-[#edf4e2] md:text-3xl">Lihat Sejauh Mana Kamu Berkembang</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#aab9a7]">Tinjau pemahamanmu dengan pertanyaan baru, lalu bandingkan hasil belajarmu.</p>
          </div>
        </div>

        <QuizRunner kind="posttest" />
      </div>
    </AppShell>
  );
}
