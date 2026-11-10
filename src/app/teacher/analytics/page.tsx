import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTeacherStats } from "@/lib/teacherStats";
import { Users, FileCheck2, BookOpen, BarChart3, TrendingUp, Info } from "lucide-react";

export default async function TeacherAnalytics() {
  const user = await getCurrentUser();
  if (!user) return null;
  const st = await getTeacherStats(user.id, user.role === "ADMIN");
  const materials = await db.material.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  const completedByMaterial = await db.progress.groupBy({
    by: ["materialId"],
    where: { materialId: { in: materials.map((material) => material.id) }, completed: true, userId: { in: st.ids } },
    _count: { _all: true },
  });
  const doneByMaterialId = new Map(completedByMaterial.map((item) => [item.materialId, item._count._all]));
  const perMat = materials.map((material) => ({ title: material.title, done: doneByMaterialId.get(material.id) ?? 0 }));
  const total = st.count;
  
  // Get pretest/posttest distribution
  const pres = await db.pretestAttempt.findMany({ where: { userId: { in: st.ids } }, orderBy: { completedAt: "desc" } });
  const posts = await db.posttestAttempt.findMany({ where: { userId: { in: st.ids } }, orderBy: { completedAt: "desc" } });
  
  const latestPre = new Map<string, number>();
  for (const r of pres) if (!latestPre.has(r.userId)) latestPre.set(r.userId, r.score);
  const latestPost = new Map<string, number>();
  for (const r of posts) if (!latestPost.has(r.userId)) latestPost.set(r.userId, r.score);
  
  const preScores = Array.from(latestPre.values());
  const postScores = Array.from(latestPost.values());
  const pairedScores = Array.from(latestPre.entries())
    .filter(([studentId]) => latestPost.has(studentId))
    .map(([studentId, score]) => (latestPost.get(studentId) ?? score) - score);
  const pairedChange = pairedScores.length
    ? Math.round(pairedScores.reduce((sum, score) => sum + score, 0) / pairedScores.length)
    : null;
  
  const scoreRanges = [
    { min: 0, max: 39, label: "0–39", color: "#bd8f82" },
    { min: 40, max: 59, label: "40–59", color: "#d5ad6c" },
    { min: 60, max: 79, label: "60–79", color: "#8cae70" },
    { min: 80, max: 100, label: "80–100", color: "#4f8458" },
  ];

  const getDistribution = (scores: number[]) => {
    return scoreRanges.map((range) => {
      const count = scores.filter((score) => score >= range.min && score <= range.max).length;
      return { ...range, count };
    });
  };

  const preDist = getDistribution(preScores);
  const postDist = getDistribution(postScores);

  return (
    <AppShell allow={["TEACHER", "ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-sage-600" />
              Analytics Kelas
            </h1>
            <p className="text-slate-600 mt-1">Ringkasan nilai tes dan penyelesaian materi kelas.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge badge-primary">
              <Users className="w-3.5 h-3.5" />
              {st.count} Siswa
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-700">{st.count}</p>
                <p className="text-xs text-slate-500">Total Siswa</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-700">{st.preCount ? `${st.avgPre}/100` : "—"}</p>
                <p className="text-xs text-slate-500">Rata-rata pretest terakhir · {st.preCount} siswa</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-700">{st.postCount ? `${st.avgPost}/100` : "—"}</p>
                <p className="text-xs text-slate-500">Rata-rata posttest terakhir · {st.postCount} siswa</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pairedChange === null ? "bg-sage-100" : pairedChange >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                <TrendingUp className={`w-5 h-5 ${pairedChange === null ? "text-sage-600" : pairedChange >= 0 ? "text-green-600" : "text-red-600"}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${pairedChange === null ? "text-slate-700" : pairedChange >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {pairedChange === null ? "—" : `${pairedChange >= 0 ? "+" : ""}${pairedChange}`}
                </p>
                <p className="text-xs text-slate-500">Rata-rata selisih nilai dari {st.pairedCount} siswa yang sudah mengerjakan kedua tes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Score Distribution */}
          <section className="card" aria-labelledby="score-distribution-title">
            <div className="mb-5">
              <h2 id="score-distribution-title" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-sage-600" />
                Distribusi Skor
              </h2>
              <p className="mt-1 text-sm text-slate-600">Jumlah siswa pada setiap rentang nilai.</p>
            </div>

            <div className="grid gap-5">
              <ScoreDistribution title="Pretest" scores={preScores} ranges={preDist} totalStudents={st.count} />
              <ScoreDistribution title="Posttest" scores={postScores} ranges={postDist} totalStudents={st.count} />
            </div>

            <div className="mt-5 flex gap-3 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-slate-700 dark:border-[#405747] dark:bg-[#203328] dark:text-[#d7e3d1]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage-700 dark:text-[#b8d596]" />
              <p><span className="font-semibold">Cara hitung:</span> setiap siswa masuk ke satu rentang berdasarkan nilai tes terakhirnya. Angka di kanan menunjukkan jumlah siswa pada rentang tersebut.</p>
            </div>
          </section>

          {/* Material Completion */}
          <section className="card" aria-labelledby="material-completion-title">
            <div className="flex items-center justify-between mb-6">
              <h2 id="material-completion-title" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-sage-600" />
                Penyelesaian Materi per Siswa
              </h2>
            </div>
            
            <div className="space-y-3">
              {perMat.map((m, i) => (
                <div key={m.title} className="material-completion-row rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate pr-2">{m.title}</span>
                    <span className="text-xs text-slate-600">{m.done}/{total} siswa · {total ? Math.round((m.done / total) * 100) : 0}%</span>
                  </div>
                  <div className="analytics-progress-track h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div 
                      className="analytics-progress-fill h-full rounded-full bg-sage-600 transition-all" 
                      style={{ width: `${total ? Math.round((m.done / total) * 100) : 0}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </AppShell>
  );
}

function ScoreDistribution({
  title,
  scores,
  ranges,
  totalStudents,
}: {
  title: string;
  scores: number[];
  ranges: Array<{ label: string; count: number; color: string }>;
  totalStudents: number;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-[#304636] dark:bg-[#203328]" aria-label={`Distribusi nilai ${title}`}>
      <div className="mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-[#b8c7b3]">{scores.length} dari {totalStudents} siswa mengerjakan</p>
        </div>
      </div>

      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-3 dark:divide-[#304636] dark:border-[#304636] dark:bg-[#192b20]">
        {ranges.map((range) => (
          <div key={range.label} className="flex min-w-0 items-center justify-between gap-3 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700 dark:text-[#d7e3d1]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: range.color }} aria-hidden="true" />
              Nilai {range.label}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-[#e2eadc]">{range.count} siswa</span>
          </div>
        ))}
      </div>
    </section>
  );
}
