import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, KeyRound, Mail, Settings, ShieldCheck, User, Users } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const courses = user.role === "STUDENT"
    ? await db.courseStudent.findMany({ where: { studentId: user.id }, include: { course: true }, orderBy: { enrolledAt: "asc" } })
    : [];
  const initials = user.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  const roleLabel = user.role === "STUDENT" ? "Siswa" : user.role === "TEACHER" ? "Guru" : "Administrator";

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900"><User className="h-7 w-7 text-sage-700" />Profil Saya</h1>
          <p className="mt-1 text-slate-600">Informasi akun dan pengaturan profil.</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]">
          <aside className="space-y-5">
            <section className="card flex flex-col items-center p-7 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sage-600 to-[#285a3c] text-3xl font-bold text-white shadow-lg shadow-sage-900/15">{initials}</div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-800 dark:bg-[#294532] dark:text-[#dce9c9]"><ShieldCheck className="h-3.5 w-3.5" />{roleLabel}</span>
            </section>

            <section className="card space-y-3">
              <h2 className="font-semibold text-slate-900">Pengaturan Akun</h2>
              <Link href="/profile/edit" className="btn-secondary flex w-full items-center justify-center gap-2"><Settings className="h-4 w-4" />Edit profil</Link>
              <Link href="/profile/password" className="btn-secondary flex w-full items-center justify-center gap-2"><KeyRound className="h-4 w-4" />Ganti password</Link>
            </section>
          </aside>

          <div className="space-y-5">
            <section className="card space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-[#304636]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-[#294532] dark:text-[#d3e4bf]"><User className="h-5 w-5" /></span>
                <div><h2 className="text-lg font-bold text-slate-900">Informasi Akun</h2><p className="text-sm text-slate-500">Detail identitas yang digunakan untuk masuk.</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-sage-50/80 p-4 dark:bg-[#203328]"><div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><User className="h-4 w-4 text-sage-700" />Nama lengkap</div><p className="break-words font-semibold text-slate-900">{user.name}</p></div>
                <div className="rounded-xl bg-sage-50/80 p-4 dark:bg-[#203328]"><div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><Mail className="h-4 w-4 text-sage-700" />Email</div><p className="break-all font-semibold text-slate-900">{user.email}</p></div>
                <div className="rounded-xl bg-sage-50/80 p-4 dark:bg-[#203328]"><div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><KeyRound className="h-4 w-4 text-sage-700" />Username</div><p className="break-all font-mono font-semibold text-slate-900">@{user.username}</p></div>
                <div className="rounded-xl bg-sage-50/80 p-4 dark:bg-[#203328]"><div className="mb-2 flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4 text-sage-700" />Peran</div><p className="font-semibold text-slate-900">{roleLabel}</p></div>
              </div>
            </section>

            {user.role === "STUDENT" && <section className="card space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-[#304636]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-[#294532] dark:text-[#d3e4bf]"><Users className="h-5 w-5" /></span>
                <div><h2 className="text-lg font-bold text-slate-900">Kelas Saya</h2><p className="text-sm text-slate-500">Kelas yang diikuti akun ini.</p></div>
              </div>
              {courses.length === 0 ? <p className="rounded-xl bg-sage-50/80 p-4 text-sm text-slate-600 dark:bg-[#203328] dark:text-[#c6d3c1]">Belum terdaftar di kelas mana pun.</p> : <div className="space-y-2">{courses.map((enrollment) => <div key={enrollment.id} className="flex items-center gap-3 rounded-xl bg-sage-50/80 p-4 dark:bg-[#203328]"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-100 text-sage-700 dark:bg-[#294532] dark:text-[#d3e4bf]"><BookOpen className="h-4 w-4" /></span><div className="min-w-0"><p className="font-semibold text-slate-900">{enrollment.course.name}</p><p className="text-xs text-slate-500">Kelas aktif</p></div></div>)}</div>}
            </section>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
