import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { StatCard, ProgressBar } from "@/components/ui/bits";
import Link from "next/link";
import { Bot, ArrowRight, Sparkles, TrendingUp, Clock, Target, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [pre, post, materials, progresses, videos, videoDone, lastAccess] = await Promise.all([
    db.pretestAttempt.findFirst({ where: { userId: user.id }, orderBy: { completedAt: "desc" } }),
    db.posttestAttempt.findFirst({ where: { userId: user.id }, orderBy: { completedAt: "desc" } }),
    db.material.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    db.progress.findMany({ where: { userId: user.id } }),
    db.video.findMany(),
    db.videoProgress.count({ where: { userId: user.id, completed: true } }),
    db.progress.findFirst({ where: { userId: user.id }, orderBy: { lastAccessedAt: "desc" }, include: { material: true } }),
  ]);

  const doneMat = progresses.filter((p) => p.completed).length;
  const totalSteps = 1 + materials.length + videos.length + 1;
  const doneSteps = (pre ? 1 : 0) + doneMat + videoDone + (post ? 1 : 0);
  const pct = Math.round((doneSteps / Math.max(1, totalSteps)) * 100);
  const incomplete = materials.find((m) => !progresses.find((p) => p.materialId === m.id && p.completed));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <AppShell allow={["STUDENT"]}>
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{getGreeting()}, {user.name} 👋</h1>
            <p className="text-slate-600 mt-1">Selamat datang di BioLearn AI. Teruskan perjalanan belajarmu!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/ai-tutor" className="btn-primary group">
              <Sparkles className="w-5 h-5" />
              <span>Tanya AI Tutor</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard 
            title="Pretest" 
            value={pre ? String(pre.score) : "-"} 
            sub={pre ? `Benar ${pre.correctCount}/25` : "Belum dikerjakan"} 
            icon={Target}
            trend={pre ? "+0" : undefined}
          />
          <StatCard 
            title="Materi" 
            value={`${doneMat}/${materials.length}`} 
            sub={`${Math.round((doneMat/materials.length)*100)}% selesai`} 
            icon={Bot}
            trend={doneMat > 0 ? `+${doneMat}` : undefined}
          />
          <StatCard 
            title="Video" 
            value={`${videoDone}/${videos.length}`} 
            sub={`${Math.round((videoDone/videos.length)*100)}% selesai`} 
            icon={Clock}
            trend={videoDone > 0 ? `+${videoDone}` : undefined}
          />
          <StatCard 
            title="Posttest" 
            value={post ? String(post.score) : "-"} 
            sub={post ? `Benar ${post.correctCount}/25` : "Belum dikerjakan"} 
            icon={TrendingUp}
            trend={post ? `+${post.score - (pre?.score || 0)}` : undefined}
          />
          <StatCard 
            title="Progress" 
            value={`${pct}%`} 
            sub="pembelajaran" 
            icon={TrendingUp}
            trend={pct > 0 ? `+${pct}%` : undefined}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-gradient">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Progress Pembelajaran</h2>
                  <p className="text-slate-600 mt-1">Kemajuanmu dari aktivitas belajar nyata</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-sage-700">{pct}%</div>
                  <div className="text-sm text-sage-600">{doneSteps} dari {totalSteps} langkah</div>
                </div>
              </div>
              <ProgressBar value={pct} />
              <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                <div className={cn("p-3 rounded-xl", pre ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
                  <div className="text-lg font-bold text-slate-900">{pre ? "✓" : "○"}</div>
                  <div className="text-xs text-slate-500">Pretest</div>
                </div>
                <div className={cn("p-3 rounded-xl", doneMat === materials.length ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
                  <div className="text-lg font-bold text-slate-900">{doneMat}/{materials.length}</div>
                  <div className="text-xs text-slate-500">Materi</div>
                </div>
                <div className={cn("p-3 rounded-xl", videoDone === videos.length ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
                  <div className="text-lg font-bold text-slate-900">{videoDone}/{videos.length}</div>
                  <div className="text-xs text-slate-500">Video</div>
                </div>
                <div className={cn("p-3 rounded-xl", post ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200")}>
                  <div className="text-lg font-bold text-slate-900">{post ? "✓" : "○"}</div>
                  <div className="text-xs text-slate-500">Posttest</div>
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            <div className="card-hover">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sage-600" />
                Continue Learning
              </h3>
              {lastAccess ? (
                <div className="flex items-center justify-between p-4 bg-sage-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-sage-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{lastAccess.material.title}</p>
                      <p className="text-sm text-slate-500">Materi {lastAccess.material.order} • Terakhir dibuka</p>
                    </div>
                  </div>
                  <Link href={`/materi/${lastAccess.material.slug}`} className="btn-primary btn-sm">
                    Lanjutkan <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-sage-200 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">{pre ? "Mulai dari Materi 1." : "Kerjakan pretest dulu untuk mengukur kemampuan awalmu."}</p>
                  <Link href={pre ? "/materi" : "/pretest"} className="btn-primary">
                    {pre ? "Buka Materi" : "Kerjakan Pretest"}
                  </Link>
                </div>
              )}
            </div>

            {/* Recommendation */}
            <div className="card-hover">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-sage-600" />
                Rekomendasi Belajar
              </h3>
              {incomplete ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Materi yang Perlu Dipelajari</p>
                      <p className="text-sm text-slate-600 mt-1">&ldquo;{incomplete.title}&rdquo; belum selesai. Yuk selesaikan sekarang!</p>
                    </div>
                    <Link href={`/materi/${incomplete.slug}`} className="btn-secondary btn-sm">
                      Pelajari Sekarang
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-600 mb-4">Semua materi selesai! Mantap! 🎉</p>
                  {pre && !post && (
                    <Link href="/posttest" className="btn-primary inline-flex">
                      Kerjakan Posttest <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Score Comparison */}
            {pre && post && (
              <div className="card-hover ">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sage-600" />
                  Perubahan Skor
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Pretest</span>
                      <span className="font-semibold text-sky-600">{pre.score}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pre.score}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Posttest</span>
                      <span className="font-semibold text-sage-600">{post.score}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${post.score}%` }} />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-sage-50 to-sage-100 border border-sage-200 dark:from-[#1d3325] dark:to-[#192b20] dark:border-[#304636]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Perubahan Skor</span>
                      <span className={cn("font-bold text-lg", post.score - pre.score >= 0 ? "text-green-600" : "text-red-600")}>
                        {post.score - pre.score >= 0 ? "+" : ""}{post.score - pre.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Perubahan skor individu</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Tutor Card */}
            <div className="card-hover bg-gradient-to-br from-sage-50 to-white border-sage-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-600 to-sage-700 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Butuh Bantuan Belajar?</h3>
                  <p className="text-sm text-slate-600 mt-1">AI Tutor siap bantu menjelaskan materi Biologi dengan bahasa yang mudah dipahami.</p>
                </div>
              </div>
              <Link href="/ai-tutor" className="btn-primary w-full justify-center mt-4">
                <Sparkles className="w-4 h-4" />
                Tanya AI Tutor
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="card-hover ">
              <h3 className="font-semibold text-slate-900 mb-4">Ringkasan Cepat</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="text-2xl font-bold text-sage-700">{materials.length}</div>
                  <div className="text-xs text-slate-500">Total Materi</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="text-2xl font-bold text-sage-700">{videos.length}</div>
                  <div className="text-xs text-slate-500">Total Video</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="text-2xl font-bold text-sage-700">25</div>
                  <div className="text-xs text-slate-500">Soal per Tes</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <div className="text-2xl font-bold text-sage-700">6</div>
                  <div className="text-xs text-slate-500">Bab Materi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
