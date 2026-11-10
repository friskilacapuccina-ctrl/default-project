import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProgressBar } from "@/components/ui/bits";
import Link from "next/link";
import { TrendingUp, BookOpen, Video, FileCheck2, Target, TrendingUp as TrendingUpIcon, Award, Sparkles, CheckCircle2 } from "lucide-react";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const [pre, post, materials, progresses, videos, videoDone] = await Promise.all([
    db.pretestAttempt.findFirst({ where: { userId: user.id }, orderBy: { completedAt: "desc" } }),
    db.posttestAttempt.findFirst({ where: { userId: user.id }, orderBy: { completedAt: "desc" } }),
    db.material.findMany({ orderBy: { order: "asc" } }),
    db.progress.findMany({ where: { userId: user.id } }),
    db.video.findMany({ orderBy: { order: "asc" }, include: { material: true } }),
    db.videoProgress.findMany({ where: { userId: user.id, completed: true } }),
  ]);
  
  const doneIds = new Set(videoDone.map((v) => v.videoId));
  const doneMat = progresses.filter((p) => p.completed).length;
  const total = 1 + materials.length + videos.length + 1;
  const done = (pre ? 1 : 0) + doneMat + videoDone.length + (post ? 1 : 0);
  const pct = Math.round((done / Math.max(1, total)) * 100);
  
  // Calculate streaks and achievements
  const completedMaterials = progresses.filter(p => p.completed).length;
  const completedVideos = videoDone.length;
  
  return (
    <AppShell allow={["STUDENT"]}>
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <TrendingUpIcon className="w-8 h-8 text-sage-600" />
            Progress Belajar
          </h1>
          <p className="text-slate-600 mt-1">Dihitung dari aktivitas nyata — setiap langkah dihitung</p>
        </div>

        {/* Main Progress Card */}
        <div className="card-gradient mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-600 to-sage-700 flex items-center justify-center shadow-lg shadow-sage-600/30">
                  <TrendingUpIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-sage-600 font-medium uppercase tracking-wider">Overall Progress</p>
                  <p className="text-4xl font-extrabold text-slate-900">{pct}%</p>
                </div>
              </div>
              <p className="text-slate-600">{done} dari {total} langkah selesai • {completedMaterials}/{materials.length} materi • {videoDone.length}/{videos.length} video</p>
            </div>
            
            <div className="flex-1">
              <ProgressBar value={pct} />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4">
            <div className={cn("p-4 rounded-xl text-center", pre ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center", pre ? "bg-green-100" : "bg-slate-100")}>
                {pre ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <FileCheck2 className="w-6 h-6 text-slate-400" />}
              </div>
              <p className="font-semibold text-slate-900">{pre ? "Selesai" : "Belum"}</p>
              <p className="text-xs text-slate-500">Pretest</p>
            </div>
            <div className={cn("p-4 rounded-xl text-center", completedMaterials === materials.length ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center", completedMaterials === materials.length ? "bg-green-100" : "bg-slate-100")}>
                {completedMaterials === materials.length ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <BookOpen className="w-6 h-6 text-slate-400" />}
              </div>
              <p className="font-semibold text-slate-900">{completedMaterials}/{materials.length}</p>
              <p className="text-xs text-slate-500">Materi</p>
            </div>
            <div className={cn("p-4 rounded-xl text-center", videoDone.length === videos.length ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center", videoDone.length === videos.length ? "bg-green-100" : "bg-slate-100")}>
                {videoDone.length === videos.length ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Video className="w-6 h-6 text-slate-400" />}
              </div>
              <p className="font-semibold text-slate-900">{videoDone.length}/{videos.length}</p>
              <p className="text-xs text-slate-500">Video</p>
            </div>
            <div className={cn("p-4 rounded-xl text-center", post ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
              <div className={cn("w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center", post ? "bg-green-100" : "bg-slate-100")}>
                {post ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <FileCheck2 className="w-6 h-6 text-slate-400" />}
              </div>
              <p className="font-semibold text-slate-900">{post ? "Selesai" : "Belum"}</p>
              <p className="text-xs text-slate-500">Posttest</p>
            </div>
          </div>
        </div>

        {/* Score Comparison */}
        {pre && post && (
          <div className="card-hover mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Perbandingan Skor</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-sage-50 border border-sage-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4 text-sage-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Pretest</h3>
                </div>
                <div className="progress-bar mb-3">
                  <div className="progress-fill" style={{ width: `${pre.score}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Skor</span>
                  <span className="font-bold text-sage-700">{pre.score}/100</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Benar: {pre.correctCount}/25</span>
                  <span>Salah: {pre.wrongCount}/25</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-sage-50 border border-sage-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4 text-sage-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Posttest</h3>
                </div>
                <div className="progress-bar mb-3">
                  <div className="progress-fill" style={{ width: `${post.score}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Skor</span>
                  <span className="font-bold text-sage-600">{post.score}/100</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Benar: {post.correctCount}/25</span>
                  <span>Salah: {post.wrongCount}/25</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-200 dark:from-[#1d3325] dark:to-[#192b20] dark:border-[#304636]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Perubahan Skor Individu</p>
                  <p className={cn("text-2xl font-extrabold", post.score - pre.score >= 0 ? "text-green-600" : "text-red-600")}>
                    {post.score - pre.score >= 0 ? "+" : ""}{post.score - pre.score}
                  </p>
                </div>
                <div className={cn("px-4 py-2 rounded-full text-sm font-semibold", post.score >= pre.score ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {post.score >= pre.score ? "Naik 📈" : "Turun 📉"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Progress */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Materials */}
          <div className="card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Materi Pembelajaran</h2>
                  <p className="text-sm text-slate-500">{completedMaterials}/{materials.length} selesai</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {materials.map((m) => {
                const p = progresses.find((x) => x.materialId === m.id);
                const isDone = p?.completed;
                const progPct = p?.progressPercentage || 0;
                return (
                  <div key={m.id} className="progress-material-row group p-3 rounded-xl bg-slate-50/50 hover:bg-sage-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="badge badge-primary text-xs">Materi {m.order}</span>
                        <span className="progress-material-title font-medium text-slate-900 truncate">{m.title}</span>
                      </div>
                      {isDone ? (
                        <span className="badge badge-success flex items-center gap-1">
                          <CheckCircle2 size={10} /> Selesai
                        </span>
                      ) : (
                        <Link href={`/materi/${m.slug}`} className="progress-material-action text-sage-700 font-medium text-sm hover:text-sage-800">
                          Lanjutkan
                        </Link>
                      )}
                    </div>
                    {!isDone && (
                      <ProgressBar value={progPct} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Videos */}
          <div className="card-hover ">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                  <Video className="w-5 h-5 text-sage-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Video Pembelajaran</h2>
                  <p className="text-sm text-slate-500">{videoDone.length}/{videos.length} selesai</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {videos.map((v) => {
                const isDone = doneIds.has(v.id);
                return (
                  <Link key={v.id} href="/video" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-sage-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5 text-sage-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate group-hover:text-sage-700 transition-colors">{v.title}</p>
                      <p className="text-xs text-slate-500">{v.material.title}</p>
                    </div>
                    {isDone ? (
                      <span className="badge badge-success flex-shrink-0">
                        <CheckCircle2 size={10} /> Selesai
                      </span>
                    ) : (
                      <span className="badge badge-primary text-xs">Tonton</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="card-hover">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-sage-700" />
            </div>
            <h2 className="font-semibold text-slate-900">Hasil Tes</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-sage-50 border border-sage-100">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck2 className="w-5 h-5 text-sage-700" />
                <span className="font-semibold text-slate-900">Pretest</span>
              </div>
              <p className="text-3xl font-extrabold text-sage-700">{pre ? pre.score : "—"}</p>
              <p className="text-sm text-slate-500">{pre ? `Benar ${pre.correctCount} • Salah ${pre.wrongCount}` : "Belum dikerjakan"}</p>
            </div>
            <div className="p-4 rounded-xl bg-sage-50 border border-sage-100">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck2 className="w-5 h-5 text-sage-600" />
                <span className="font-semibold text-slate-900">Posttest</span>
              </div>
              <p className="text-3xl font-extrabold text-sage-600">{post ? post.score : "—"}</p>
              <p className="text-sm text-slate-500">{post ? `Benar ${post.correctCount} • Salah ${post.wrongCount}` : "Belum dikerjakan"}</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-sage-600" />
            Pencapaian
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Pretest Selesai", desc: "Mengerjakan pretest hingga selesai", earned: !!pre, icon: FileCheck2 },
              { title: "Semua Materi", desc: "Menyelesaikan 6 materi", earned: completedMaterials === materials.length, icon: BookOpen },
              { title: "Semua Video", desc: "Menonton 6 video", earned: videoDone.length === videos.length, icon: Video },
              { title: "Posttest Selesai", desc: "Mengerjakan posttest hingga selesai", earned: !!post, icon: FileCheck2 },
              { title: "Penambah Skor", desc: "Skor posttest > pretest", earned: Boolean(pre && post && post.score > pre.score), icon: TrendingUp },
              { title: "Pembelajar Aktif", desc: "Progress > 50%", earned: pct > 50, icon: Sparkles },
            ].map((ach, i) => (
              <div key={ach.title} className={cn("p-4 rounded-xl text-center transition-colors", ach.earned ? "bg-gradient-to-br from-sage-50 to-sage-100 border-2 border-sage-300 dark:from-[#203829] dark:to-[#1a3023] dark:border-[#456344]" : "bg-slate-50 border border-slate-200 opacity-75")} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={cn("w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center", ach.earned ? "bg-sage-200 text-sage-800 dark:bg-[#294532] dark:text-[#c9dfa9]" : "bg-slate-100 text-slate-400 dark:bg-[#26372b] dark:text-[#81917d]")}>
                  <ach.icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">{ach.title}</p>
                <p className="text-xs text-slate-500 mt-1">{ach.desc}</p>
                {ach.earned && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-sage-200 text-sage-900 dark:bg-[#294532] dark:text-[#d3e4bf] rounded-full">
                    ✓ Terbuka
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
