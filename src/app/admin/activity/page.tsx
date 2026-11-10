import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { Activity, ShieldCheck } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  USER_CREATE: "Membuat akun", USER_UPDATE: "Mengubah akses akun", MATERIAL_CREATE: "Menambahkan materi",
  MATERIAL_PUBLISH: "Mengubah publikasi materi", MATERIAL_UNPUBLISH: "Menyembunyikan materi", MATERIAL_DELETE: "Menghapus materi",
  VIDEO_CREATE: "Menambahkan video", VIDEO_UPDATE: "Mengubah video", VIDEO_DELETE: "Menghapus video",
  STUDENT_ENROLL: "Menambahkan siswa ke kelas", STUDENT_UNENROLL: "Mengeluarkan siswa dari kelas",
  TEACHER_ASSIGN: "Menugaskan guru ke kelas", TEACHER_UNASSIGN: "Mencabut penugasan guru",
  COURSE_CREATE: "Membuat kelas", COURSE_UPDATE: "Mengubah kelas", COURSE_DELETE: "Menghapus kelas",
};

export default async function AdminActivity() {
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true, username: true } } } });
  return <AppShell allow={["ADMIN"]}>
    <div className="mb-6"><h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900"><Activity className="h-7 w-7 text-sage-600" />Aktivitas Admin</h1><p className="mt-1 text-sm text-slate-600">Catatan perubahan penting pada akun dan konten. Menampilkan 100 aktivitas terbaru.</p></div>
    <section className="card">
      {logs.length === 0 ? <div className="py-12 text-center"><ShieldCheck className="mx-auto mb-3 h-10 w-10 text-sage-500" /><p className="font-medium text-slate-800">Belum ada aktivitas tercatat.</p><p className="mt-1 text-sm text-slate-500">Aksi administratif akan muncul di sini.</p></div> : <div className="divide-y divide-slate-100">{logs.map((log) => {
        const details = log.detail && typeof log.detail === "object" && !Array.isArray(log.detail) ? log.detail as Record<string, unknown> : {};
        const detailText = Object.entries(details).map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
        return <article key={log.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-medium text-slate-900">{ACTION_LABELS[log.action] ?? log.action}</p><p className="mt-1 text-sm text-slate-600">{log.actor?.name ?? "Akun tidak tersedia"}{log.actor?.username ? ` (@${log.actor.username})` : ""} · {log.targetType}{log.targetId ? ` ${log.targetId.slice(0, 8)}` : ""}</p>{detailText && <p className="mt-1 break-words text-xs text-slate-500">{detailText}</p>}</div><time className="shrink-0 text-xs text-slate-500">{log.createdAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</time></article>;
      })}</div>}
    </section>
  </AppShell>;
}
