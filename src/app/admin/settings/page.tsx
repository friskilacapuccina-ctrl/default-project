import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { Activity, CheckCircle2, Database, ExternalLink, KeyRound, Settings2, XCircle } from "lucide-react";

export default async function AdminSettings() {
  let databaseConnected = false;
  try { await db.$queryRaw`SELECT 1`; databaseConnected = true; } catch { databaseConnected = false; }
  const databaseConfigured = !!process.env.DATABASE_URL;
  const aiConfigured = !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_openai"));
  return <AppShell allow={["ADMIN"]}>
    <div className="mb-6"><h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900"><Settings2 className="h-7 w-7 text-sage-600" />Status & Pengaturan</h1><p className="mt-1 text-sm text-slate-600">Pemeriksaan konfigurasi server. Nilai rahasia tidak ditampilkan di halaman.</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      <StatusCard icon={<Database />} title="Database" status={databaseConnected ? "Koneksi berhasil" : databaseConfigured ? "Tidak dapat terhubung" : "Belum dikonfigurasi"} detail={databaseConfigured ? "URL database terdeteksi di server." : "Tambahkan DATABASE_URL pada konfigurasi server."} ok={databaseConnected} />
      <StatusCard icon={<KeyRound />} title="AI Tutor" status={aiConfigured ? "API key tersedia" : "Mode fallback"} detail={aiConfigured ? "Kredensial terdeteksi; status kuota/koneksi tidak diuji di halaman ini." : "Tambahkan OPENAI_API_KEY pada konfigurasi server untuk mengaktifkan layanan eksternal."} ok={aiConfigured} />
      <div className="card md:col-span-2"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700"><Activity className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Riwayat perubahan</h2><p className="mt-1 text-sm text-slate-600">Periksa tindakan akun dan pengelolaan konten yang dicatat sistem.</p><Link href="/admin/activity" className="btn-secondary mt-3 inline-flex items-center gap-2">Buka aktivitas admin <ExternalLink className="h-4 w-4" /></Link></div></div></div>
    </div>
    <p className="mt-5 text-xs text-slate-500">Untuk mengubah secret, gunakan environment variables di mesin atau platform deployment. Jangan memasukkan API key ke browser maupun database aplikasi.</p>
  </AppShell>;
}

function StatusCard({ icon, title, status, detail, ok }: { icon: React.ReactNode; title: string; status: string; detail: string; ok: boolean }) {
  return <section className="card"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ok ? "bg-sage-100 text-sage-700" : "bg-amber-100 text-amber-700"}`}>{icon}</span><div className="min-w-0"><h2 className="font-semibold text-slate-900">{title}</h2><p className={`mt-1 flex items-center gap-1 text-sm font-medium ${ok ? "text-sage-700" : "text-amber-700"}`}>{ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{status}</p><p className="mt-2 text-sm text-slate-500">{detail}</p></div></div></section>;
}
