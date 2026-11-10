import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getTeacherStats } from "@/lib/teacherStats";
import { ArrowRight, BarChart3, BookOpen, FileCheck2, Users } from "lucide-react";

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;
  const stats = await getTeacherStats(user.id, user.role === "ADMIN");
  const greeting = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
  })();
  const postPct = stats.count ? Math.round((stats.finishedPost / stats.count) * 100) : 0;

  return <AppShell allow={["TEACHER", "ADMIN"]}>
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-sage-700">Dashboard Guru</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{greeting}, {user.name}</h1><p className="mt-1 text-slate-600">Ringkasan kelas dan perkembangan belajar siswa.</p></div>
        <Link href="/teacher/students" className="btn-primary inline-flex items-center gap-2">Data siswa <ArrowRight className="h-4 w-4" /></Link>
      </header>

      <section aria-label="Ringkasan kelas" className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Siswa di kelas" value={stats.count} note="Siswa terdaftar" icon={<Users className="h-5 w-5" />} />
        <SummaryCard label="Selesai posttest" value={`${stats.finishedPost}/${stats.count}`} note={`${postPct}% siswa`} icon={<FileCheck2 className="h-5 w-5" />} />
        <SummaryCard label="Perubahan nilai" value={stats.pairedCount ? `${stats.pairedChange > 0 ? "+" : ""}${stats.pairedChange}` : "—"} note={stats.pairedCount ? `Dari ${stats.pairedCount} siswa yang menyelesaikan kedua tes` : "Belum ada hasil tes berpasangan"} icon={<BarChart3 className="h-5 w-5" />} />
      </section>

      <section className="card space-y-5">
        <div><h2 className="text-lg font-semibold text-slate-900">Rata-rata nilai terbaru</h2><p className="mt-1 text-sm text-slate-500">Nilai tertinggi terbaru tiap siswa; perubahan dihitung hanya untuk siswa yang punya kedua nilai.</p></div>
        <ScoreRow label="Pretest" value={stats.avgPre} count={stats.preCount} tone="bg-[#789b64]" />
        <ScoreRow label="Posttest" value={stats.avgPost} count={stats.postCount} tone="bg-[#3e704c]" />
        <p className="rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-900">{stats.pairedCount ? `Pada ${stats.pairedCount} siswa yang menyelesaikan pretest dan posttest, perubahan rata-rata adalah ${stats.pairedChange > 0 ? "+" : ""}${stats.pairedChange} poin.` : "Perubahan nilai akan tampil setelah siswa menyelesaikan kedua tes."}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Nilai posttest tertinggi</h2><p className="text-sm text-slate-500">Nilai terbaru siswa, bukan nilai terbaik sepanjang waktu.</p></div><Link href="/teacher/results" className="text-sm font-medium text-sage-700 hover:underline">Semua hasil</Link></div>
          {stats.topStudents.length ? <ol className="divide-y divide-slate-100">{stats.topStudents.map((student, index) => <li key={student.id} className="flex items-center justify-between gap-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-sage-800">{index + 1}</span><div className="min-w-0"><p className="truncate font-medium text-slate-900">{student.name}</p><p className="truncate text-xs text-slate-500">{student.username}</p></div></div><span className="text-lg font-semibold tabular-nums text-sage-800">{student.score}<span className="ml-1 text-xs font-normal text-slate-500">/100</span></span></li>)}</ol> : <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada nilai posttest.</p>}
        </section>
        <section className="card "><h2 className="text-lg font-semibold text-slate-900">Menu kerja</h2><p className="mb-4 mt-1 text-sm text-slate-500">Pilih tugas yang ingin dikerjakan.</p><div className="space-y-2">
          <ActionLink href="/teacher/students" icon={<Users className="h-4 w-4" />} label="Data siswa" detail="Cari dan pantau progres kelas" />
          <ActionLink href="/teacher/results" icon={<FileCheck2 className="h-4 w-4" />} label="Hasil belajar" detail="Tinjau nilai dan ekspor data" />
          <ActionLink href="/teacher/assessments" icon={<FileCheck2 className="h-4 w-4" />} label="Kelola Pretest & Posttest" detail="Tambah, edit, atau hapus soal" />
          <ActionLink href="/teacher/enrollment" icon={<BookOpen className="h-4 w-4" />} label="Enrollment" detail="Atur siswa di kelas yang diampu" />
          <ActionLink href="/teacher/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analitik kelas" detail="Lihat ringkasan materi dan tes" />
        </div></section>
      </div>
    </div>
  </AppShell>;
}

function SummaryCard({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: React.ReactNode }) {
  return <div className="card !p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-100 text-sage-700">{icon}</span></div><p className="mt-2 text-xs text-slate-500">{note}</p></div>;
}

function ScoreRow({ label, value, count, tone }: { label: string; value: number; count: number; tone: string }) {
  return <div><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{label}</span><span className="font-semibold tabular-nums text-slate-900">{value}<span className="ml-1 font-normal text-slate-500">/100 · {count} siswa</span></span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}

function ActionLink({ href, icon, label, detail }: { href: string; icon: React.ReactNode; label: string; detail: string }) {
  return <Link href={href} className="group flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 transition-colors hover:border-sage-300 hover:bg-sage-50"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">{icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{label}</span><span className="block truncate text-xs text-slate-500">{detail}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" /></Link>;
}
