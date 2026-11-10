"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

type BookValues = { title: string; description: string; fileName: string; fileUrl: string; version: string };
export function ManualBookForm({ initial }: { initial: BookValues }) {
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const field = (key: keyof BookValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function save(event: FormEvent) {
    event.preventDefault(); setPending(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/manual-book", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Buku petunjuk belum berhasil disimpan."); return; }
      setNotice("Pengaturan buku petunjuk berhasil disimpan."); router.refresh();
    } catch { setError("Koneksi gagal. Periksa jaringan lalu coba lagi."); }
    finally { setPending(false); }
  }
  return <form onSubmit={save} className="card space-y-4">
    <div><h2 className="font-semibold text-slate-900">Pengaturan buku petunjuk</h2><p className="mt-1 text-sm text-slate-600">Tempel path PDF lokal atau tautan HTTPS. File PDF perlu tersedia di path/penyimpanan tersebut.</p></div>
    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-1 text-sm font-medium text-slate-700">Judul<input className="input" value={form.title} onChange={field("title")} minLength={2} maxLength={160} required /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700">Versi<input className="input" value={form.version} onChange={field("version")} maxLength={40} required /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700">Nama file<input className="input" value={form.fileName} onChange={field("fileName")} maxLength={200} placeholder="panduan-biolearn.pdf" /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700">URL / path PDF<input className="input" value={form.fileUrl} onChange={field("fileUrl")} maxLength={2000} placeholder="/manuals/panduan.pdf atau https://..." /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">Deskripsi<textarea className="input resize-y" rows={3} value={form.description} onChange={field("description")} maxLength={1000} /></label>
    </div>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
    <button className="btn-primary inline-flex items-center gap-2" disabled={pending}><Save className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan"}</button>
  </form>;
}
