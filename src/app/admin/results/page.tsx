import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { BarChart3, BookOpen, FileCheck2, TrendingUp, Users } from "lucide-react";
import { ExportAdminResults } from "./ExportAdminResults";

export default async function AdminResults() {
  const [pretests, posttests, materials, progress, studentCount] = await Promise.all([
    db.pretestAttempt.findMany({ orderBy: { completedAt: "desc" }, select: { id: true, userId: true, score: true, correctCount: true, wrongCount: true, completedAt: true, user: { select: { username: true, name: true } } } }),
    db.posttestAttempt.findMany({ orderBy: { completedAt: "desc" }, select: { id: true, userId: true, score: true, correctCount: true, wrongCount: true, completedAt: true, user: { select: { username: true, name: true } } } }),
    db.material.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { id: true, title: true } }),
    db.progress.groupBy({ by: ["materialId"], where: { completed: true, material: { published: true } }, _count: { _all: true } }),
    db.user.count({ where: { role: "STUDENT" } }),
  ]);
  const latest = <T extends { userId: string }>(rows: T[]) => {
    const map = new Map<string, T>();
    for (const row of rows) if (!map.has(row.userId)) map.set(row.userId, row);
    return map;
  };
  const latestPre = latest(pretests);
  const latestPost = latest(posttests);
  const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  const paired = Array.from(latestPre.entries()).filter(([id]) => latestPost.has(id)).map(([id, pre]) => latestPost.get(id)!.score - pre.score);
  const pairedAverage = average(paired);
  const preAverage = average(Array.from(latestPre.values(), (item) => item.score));
  const postAverage = average(Array.from(latestPost.values(), (item) => item.score));
  const doneByMaterial = new Map(progress.map((item) => [item.materialId, item._count._all]));
  const recent = [...pretests.map((item) => ({ ...item, test: "Pretest" })), ...posttests.map((item) => ({ ...item, test: "Posttest" }))]
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, 20);

  return <AppShell allow={["ADMIN"]}>
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900"><BarChart3 className="h-7 w-7 text-sage-600" />Hasil & Analytics</h1><p className="mt-1 text-sm text-slate-600">Ringkasan semua siswa, nilai terbaru, progres materi, dan aktivitas tes terbaru.</p></div>
      <ExportAdminResults pretests={pretests.map((r) => ({ username: r.user.username, test: "Pretest", score: r.score, correctCount: r.correctCount, wrongCount: r.wrongCount, completedAt: r.completedAt.toISOString() }))} posttests={posttests.map((r) => ({ username: r.user.username, test: "Posttest", score: r.score, correctCount: r.correctCount, wrongCount: r.wrongCount, completedAt: r.completedAt.toISOString() }))} />
    </div>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Summary icon={<FileCheck2 />} label="Pretest dikerjakan" value={pretests.length} detail={`${latestPre.size} siswa`} />
      <Summary icon={<FileCheck2 />} label="Posttest dikerjakan" value={posttests.length} detail={`${latestPost.size} siswa`} />
      <Summary icon={<TrendingUp />} label="Perubahan berpasangan" value={pairedAverage === null ? "—" : `${pairedAverage > 0 ? "+" : ""}${pairedAverage}`} detail={`${paired.length} siswa dengan dua nilai`} />
      <Summary icon={<Users />} label="Siswa dengan nilai tes" value={new Set([...latestPre.keys(), ...latestPost.keys()]).size} detail="Nilai terbaru per siswa" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <section className="card"><div className="mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-sage-600" /><h2 className="font-semibold text-slate-900">Penyelesaian materi</h2></div>
        {materials.length === 0 ? <p className="py-5 text-sm text-slate-500">Belum ada materi yang diterbitkan.</p> : <ul className="space-y-3">{materials.map((material) => { const count = doneByMaterial.get(material.id) ?? 0; const pct = studentCount ? Math.round((count / studentCount) * 100) : 0; return <li key={material.id} className="completion-item rounded-xl bg-sage-50/70 p-3"><div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-sm font-medium text-slate-800">{material.title}</span><span className="shrink-0 text-xs text-slate-600">{count}/{studentCount} siswa · {pct}%</span></div><div className="completion-track h-2 overflow-hidden rounded-full bg-slate-200"><div className="completion-fill h-full rounded-full bg-sage-600" style={{ width: `${pct}%` }} /></div></li>; })}</ul>}
      </section>
      <section className="card "><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-slate-900">20 percobaan terbaru</h2><span className="text-xs text-slate-500">Semua jenis tes diurutkan berdasarkan waktu</span></div>
        {recent.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Belum ada percobaan tes.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead><tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500"><th className="p-3">Siswa</th><th className="p-3">Tes</th><th className="p-3 text-center">Nilai</th><th className="p-3">Waktu</th></tr></thead><tbody className="divide-y divide-slate-100">{recent.map((attempt) => <tr key={`${attempt.test}-${attempt.id}`}><td className="p-3"><p className="font-medium text-slate-900">{attempt.user.name}</p><p className="text-xs text-slate-500">@{attempt.user.username}</p></td><td className="p-3">{attempt.test}</td><td className="p-3 text-center font-semibold">{attempt.score}</td><td className="p-3 text-slate-500">{attempt.completedAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
    <p className="mt-4 text-xs text-slate-500">Rata-rata nilai menggunakan percobaan terbaru tiap siswa. Perubahan berpasangan hanya membandingkan siswa yang mempunyai nilai pretest dan posttest.</p>
  </AppShell>;
}

function Summary({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string | number; detail: string }) {
  return <div className="card"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700">{icon}</span><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{detail}</p></div></div></div>;
}
