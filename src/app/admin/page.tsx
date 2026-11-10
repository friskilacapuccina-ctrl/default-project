import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { Activity, ArrowRight, BarChart3, BookOpen, CheckCircle2, FileCheck2, GraduationCap, Settings2, Users, Video } from "lucide-react";

export default async function AdminDashboard() {
  const [teachers, students, courses, enrollments, materials, videos, pretests, posttests] = await Promise.all([
    db.user.count({ where: { role: "TEACHER" } }), db.user.count({ where: { role: "STUDENT" } }),
    db.course.count(), db.courseStudent.count(), db.material.count({ where: { published: true } }), db.video.count(),
    db.pretestAttempt.findMany({ select: { userId: true, score: true }, orderBy: { completedAt: "desc" } }),
    db.posttestAttempt.findMany({ select: { userId: true, score: true }, orderBy: { completedAt: "desc" } }),
  ]);
  const latestScores = (rows: Array<{ userId: string; score: number }>) => {
    const latest = new Map<string, number>();
    for (const row of rows) if (!latest.has(row.userId)) latest.set(row.userId, row.score);
    const values = Array.from(latest.values());
    return { values, average: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null };
  };
  const pre = latestScores(pretests);
  const post = latestScores(posttests);
  const latestPre = new Map<string, number>();
  const latestPost = new Map<string, number>();
  for (const row of pretests) if (!latestPre.has(row.userId)) latestPre.set(row.userId, row.score);
  for (const row of posttests) if (!latestPost.has(row.userId)) latestPost.set(row.userId, row.score);
  const changes = Array.from(latestPre.entries()).filter(([id]) => latestPost.has(id)).map(([id, score]) => (latestPost.get(id) ?? score) - score);
  const change = changes.length ? Math.round(changes.reduce((sum, value) => sum + value, 0) / changes.length) : null;
  let databaseConnected = false;
  try { await db.$queryRaw`SELECT 1`; databaseConnected = true; } catch { databaseConnected = false; }
  const aiConfigured = !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_openai"));

  return <AppShell allow={["ADMIN"]}>
    <div className="mx-auto max-w-5xl space-y-6">
      <header><p className="text-sm font-medium text-sage-700">Area Admin</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Ringkasan sistem</h1><p className="mt-1 text-slate-600">Kelola akun, kelas, dan konten dari satu tempat.</p></header>

      <section aria-label="Ringkasan sistem" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Siswa" value={students} note="Akun siswa" icon={<Users className="h-5 w-5" />} />
        <Metric label="Guru" value={teachers} note="Akun pengajar" icon={<Users className="h-5 w-5" />} />
        <Metric label="Kelas" value={courses} note={`${enrollments} pendaftaran siswa`} icon={<GraduationCap className="h-5 w-5" />} />
        <Metric label="Konten tersedia" value={materials + videos} note={`${materials} materi · ${videos} video`} icon={<BookOpen className="h-5 w-5" />} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="card space-y-5">
          <div><h2 className="text-lg font-semibold text-slate-900">Hasil belajar terbaru</h2><p className="mt-1 text-sm text-slate-500">Rata-rata nilai terbaru per siswa. Perubahan memakai siswa yang punya kedua nilai tes.</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><Score label="Pretest" value={pre.average} count={pre.values.length} /><Score label="Posttest" value={post.average} count={post.values.length} /></div>
          <p className="rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-900">{change === null ? "Belum ada siswa dengan nilai pretest dan posttest." : `Perubahan rata-rata ${change > 0 ? "+" : ""}${change} poin dari ${changes.length} siswa.`}</p>
          <Link href="/admin/results" className="inline-flex items-center gap-2 text-sm font-medium text-sage-700 hover:underline">Buka hasil & analitik <ArrowRight className="h-4 w-4" /></Link>
        </section>

        <section className="card "><h2 className="text-lg font-semibold text-slate-900">Status layanan</h2><p className="mb-3 mt-1 text-sm text-slate-500">Ringkasan konfigurasi server.</p><div className="divide-y divide-slate-100">
          <StatusLine label="Database" value={databaseConnected ? "Terhubung" : "Gangguan"} ok={databaseConnected} />
          <StatusLine label="Aplikasi" value="Aktif" ok />
          <StatusLine label="AI Tutor" value={aiConfigured ? "Key terpasang" : "Mode fallback"} ok={aiConfigured} />
        </div><p className="mt-3 text-xs text-slate-500">Status key AI menunjukkan konfigurasi saja, bukan uji kuota atau koneksi.</p><Link href="/admin/settings" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sage-700 hover:underline">Detail pengaturan <ArrowRight className="h-4 w-4" /></Link></section>
      </div>

      <section className="card"><div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Menu kerja</h2><p className="mt-1 text-sm text-slate-500">Pilih area yang ingin dikelola.</p></div><div className="grid gap-2 sm:grid-cols-2">
        <Action href="/admin/users" icon={<Users />} title="Pengguna" detail="Buat akun dan atur akses" />
        <Action href="/admin/enrollment" icon={<GraduationCap />} title="Kelas & enrollment" detail="Kelola kelas, guru, dan siswa" />
        <Action href="/admin/materials" icon={<BookOpen />} title="Materi" detail="Baca isi atau hapus materi" />
        <Action href="/admin/videos" icon={<Video />} title="Video" detail="Tonton atau hapus video" />
        <Action href="/admin/activity" icon={<Activity />} title="Aktivitas admin" detail="Tinjau riwayat perubahan" />
        <Action href="/admin/manual-book" icon={<FileCheck2 />} title="Buku petunjuk" detail="Atur versi dan tautan PDF" />
      </div></section>
    </div>
  </AppShell>;
}

function Metric({ label, value, note, icon }: { label: string; value: number; note: string; icon: React.ReactNode }) {
  return <div className="card !p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-100 text-sage-700">{icon}</span></div><p className="mt-2 text-xs text-slate-500">{note}</p></div>;
}
function Score({ label, value, count }: { label: string; value: number | null; count: number }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value ?? "—"}<span className="ml-1 text-xs font-normal text-slate-500">{value === null ? "" : "/100"}</span></p><p className="text-xs text-slate-500">{count} siswa dengan nilai</p></div>;
}
function StatusLine({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div className="flex items-center justify-between gap-3 py-3"><span className="text-sm text-slate-700">{label}</span><span className={`inline-flex items-center gap-1.5 text-sm ${ok ? "text-sage-700" : "text-amber-700"}`}>{ok ? <CheckCircle2 className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}{value}</span></div>;
}
function Action({ href, icon, title, detail }: { href: string; icon: React.ReactNode; title: string; detail: string }) {
  return <Link href={href} className="group flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition-colors hover:border-sage-300 hover:bg-sage-50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">{icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{title}</span><span className="block text-xs text-slate-500">{detail}</span></span><ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" /></Link>;
}
