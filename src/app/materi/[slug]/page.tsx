import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CompleteButton } from "./CompleteButton";
import Biology3DSection from "@/components/bio3d/Biology3DSection";
import { MaterialArticle, MaterialLearningContent } from "@/components/MaterialLearningContent";

export default async function MateriDetail({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  const m = await db.material.findFirst({
    where: { slug: params.slug, ...(user?.role === "TEACHER" || user?.role === "ADMIN" ? {} : { published: true }) },
    include: { videos: true },
  });
  if (!m) notFound();
  const prog = user ? await db.progress.findUnique({ where: { userId_materialId: { userId: user.id, materialId: m.id } } }) : null;

  if (user && user.role === "STUDENT") {
    await db.progress.upsert({
      where: { userId_materialId: { userId: user.id, materialId: m.id } },
      update: { lastAccessedAt: new Date() },
      create: { userId: user.id, materialId: m.id, progressPercentage: prog?.completed ? 100 : 10 },
    });
  }

  const materialColors: Record<number, string> = {
    1: "from-sage-600 to-sage-800",
    2: "from-emerald-500 to-emerald-700",
    3: "from-lime-600 to-green-700",
    4: "from-green-500 to-sage-700",
    5: "from-teal-600 to-emerald-800",
    6: "from-sage-500 to-green-800",
  };

  const color = materialColors[m.order] || "from-sage-500 to-emerald-500";

  return (
    <AppShell allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <Link href="/materi" className="inline-flex items-center gap-2 text-sm text-sage-700 hover:text-sage-800 transition-colors mb-4 inline-block">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali ke Materi
        </Link>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`badge bg-gradient-to-r ${color} text-white px-4 py-1.5`}>Materi {m.order}</span>
          {prog?.completed && <span className="badge badge-success flex items-center gap-1"><CheckCircle2 size={12} /> Selesai</span>}
          <span className="text-sm text-slate-500">Bab {m.order} dari 6</span>
        </div>
      </div>
        
        <MaterialLearningContent
          slug={m.slug}
          title={m.title}
          description={m.description}
          objectives={m.learningObjectives}
          color={color}
        />

      <Biology3DSection slug={m.slug} />

      <MaterialArticle slug={m.slug} title={m.title} content={m.content} />

      {m.videos.length > 0 && (
        <div className="card-hover mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Video Terkait</h2>
              <p className="text-sm text-slate-500">{m.videos.length} video pembelajaran</p>
            </div>
          </div>
          <div className="space-y-3">
            {m.videos.map((v, i) => (
              <Link key={v.id} href={`/video?highlight=${v.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-sage-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 group-hover:text-sage-700 transition-colors">{v.title}</p>
                  <p className="text-xs text-slate-500">{m.title}</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-sage-600 transition-colors group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        {m.fileUrl && (
          <a href={m.fileUrl} download className="btn-secondary group flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>Download Materi PDF</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        )}
        <Link href={`/ai-tutor?materialId=${m.id}`} className="btn-primary group flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Tanya AI tentang materi ini</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
        {user?.role === "STUDENT" && !prog?.completed && <CompleteButton materialId={m.id} />}
      </div>

      {user?.role === "STUDENT" && (
        <div className="card bg-sage-50 border-sage-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Progress Materi Ini</p>
                <p className="text-sm text-slate-500">{prog?.completed ? "100% - Selesai" : prog ? `${prog.progressPercentage}%` : "0% - Belum mulai"}</p>
              </div>
            </div>
            {prog?.completed && <span className="badge badge-success">Selesai</span>}
          </div>
        </div>
      )}
    </AppShell>
  );
}
