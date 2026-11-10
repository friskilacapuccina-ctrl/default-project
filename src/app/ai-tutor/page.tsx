import { AppShell } from "@/components/layout/AppShell";
import { AIChat } from "@/components/ai/AIChat";
import { db } from "@/lib/db";
import { Bot, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function AITutorPage({ searchParams }: { searchParams: { materialId?: string } }) {
  let title: string | undefined;
  let material: any = null;
  if (searchParams.materialId) {
    material = await db.material.findFirst({
      where: { id: searchParams.materialId, published: true },
    });
    title = material?.title;
  }

  const suggestions = [
    "Jelaskan konsep fotosintesis secara sederhana",
    "Apa perbedaan sel hewan dan sel tumbuhan?",
    "Bagaimana cara kerja sistem pencernaan?",
    "Jelaskan siklus Krebs dengan analogi",
    "Apa itu ekosistem dan komponennya?",
    "Bagaimana darah mengelilingi tubuh?",
  ];

  return (
    <AppShell allow={["STUDENT"]} wide>
      <div className="flex min-h-[calc(100dvh-13rem)] flex-col animate-in fade-in duration-500 lg:h-[calc(100dvh-9rem)] lg:min-h-[560px]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-200 text-sage-800 dark:bg-[#294833] dark:text-[#c5dda6]"><Bot className="h-6 w-6" /></span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#edf4e2] md:text-3xl">AI Tutor Biologi</h1>
              <p className="truncate text-sm text-slate-600 dark:text-[#aab9a7]">{material ? `Sedang membahas: ${material.title}` : "Teman belajar Biologi yang siap membantu."}</p>
            </div>
          </div>
          {material && (
            <Link href={`/materi/${material.slug}`} className="btn-secondary btn-sm flex items-center gap-2 dark:border-[#36513b] dark:bg-[#203328] dark:text-[#dce8d3] dark:hover:bg-[#2a4532]">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Materi
            </Link>
          )}
        </header>

        {material && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-sage-200 bg-sage-50 px-3 py-2 text-sm text-sage-900 dark:border-[#304636] dark:bg-[#1a3023] dark:text-[#d5e5c4]">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="truncate">Konteks materi aktif: <strong>{material.title}</strong></span>
          </div>
        )}

        <AIChat materialId={searchParams.materialId} materialTitle={title} suggestions={suggestions} />
      </div>
    </AppShell>
  );
}
