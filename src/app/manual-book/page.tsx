import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BookMarked, Download, FileText, Users, ClipboardCheck, BookOpen, BarChart3, Settings } from "lucide-react";

const ROLE_GUIDES = {
  STUDENT: {
    title: "Panduan Siswa",
    description: "Ikuti materi biologi, gunakan media pendukung, lalu tinjau hasil belajarmu.",
    items: [
      { icon: ClipboardCheck, title: "Mulai dengan Pretest", text: "Kerjakan tes awal sebelum mempelajari enam materi BioLearn." },
      { icon: BookOpen, title: "Belajar dengan beragam media", text: "Baca materi, tonton video, gunakan AI Tutor, dan coba permainan di Ruang Santai." },
      { icon: BarChart3, title: "Tinjau hasil", text: "Selesaikan Posttest dan buka Progress untuk melihat aktivitas serta hasil tes." },
    ],
  },
  TEACHER: {
    title: "Panduan Guru",
    description: "Kelola kegiatan pembelajaran dan pantau siswa pada kelas yang ditugaskan kepada Anda.",
    items: [
      { icon: BookOpen, title: "Kelola materi dan video", text: "Tambahkan atau perbarui bahan dan media pembelajaran. Publikasi materi diatur oleh admin." },
      { icon: Users, title: "Pantau kelas", text: "Gunakan Data Siswa dan Enrollment untuk melihat siswa serta pendaftaran pada kelas yang Anda ampu." },
      { icon: ClipboardCheck, title: "Atur tes dan tinjau hasil", text: "Kelola soal Pretest dan Posttest, lalu gunakan Hasil Belajar dan Analytics untuk meninjau hasil kelas." },
    ],
  },
  ADMIN: {
    title: "Panduan Admin",
    description: "Kelola akses pengguna, penugasan kelas, publikasi konten, dan pemantauan platform.",
    items: [
      { icon: Users, title: "Kelola pengguna dan kelas", text: "Buat akun, atur peran dan status akun, serta tetapkan guru dan siswa melalui Users dan Enrollment." },
      { icon: BookOpen, title: "Tinjau dan terbitkan konten", text: "Kelola materi dan video. Periksa isi materi sebelum menerbitkannya untuk siswa." },
      { icon: BarChart3, title: "Pantau seluruh BioLearn", text: "Gunakan Hasil & Analytics, Aktivitas Admin, dan Settings untuk meninjau data serta status aplikasi." },
    ],
  },
} as const;

export default async function ManualBookPage() {
  const [user, book] = await Promise.all([
    getCurrentUser(),
    db.manualBook.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);
  const role = user?.role === "TEACHER" || user?.role === "ADMIN" ? user.role : "STUDENT";
  const guide = ROLE_GUIDES[role];
  const pdfUrl = book?.fileUrl || "/manuals/manual-book-biolearn-ai.pdf";
  const version = book?.version || "1.0";

  return (
    <AppShell allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <div className="mx-auto max-w-4xl space-y-5 animate-in fade-in duration-500">
        <header className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
            <BookMarked className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-sage-700">BioLearn AI · v{version}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Buku Petunjuk</h1>
            <p className="mt-1 text-sm text-slate-600">Ringkasan penggunaan BioLearn berdasarkan peran akun Anda.</p>
          </div>
        </header>

        <section className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{guide.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{guide.description}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {guide.items.map((item) => (
              <article key={item.title} className="rounded-xl border border-sage-100 bg-sage-50/60 p-4">
                <item.icon className="mb-2 h-5 w-5 text-sage-700" />
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Unduh manual book lengkap</h2>
            <p className="mt-1 text-sm text-slate-600">Pilih format yang ingin disimpan atau dibaca di luar aplikasi.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={pdfUrl} download={book?.fileName || "manual-book-biolearn-ai.pdf"} className="btn-primary inline-flex items-center justify-center gap-2">
              <Download className="h-4 w-4" /> Unduh PDF
            </a>
            <a href="/manuals/manual-book-biolearn-ai.docx" download="manual-book-biolearn-ai.docx" className="btn-secondary inline-flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" /> Unduh Word
            </a>
          </div>
          {role === "ADMIN" && (
            <Link href="/admin/manual-book" className="inline-flex items-center gap-2 text-sm font-medium text-sage-700 hover:underline">
              <Settings className="h-4 w-4" /> Kelola informasi manual book
            </Link>
          )}
        </section>
      </div>
    </AppShell>
  );
}
