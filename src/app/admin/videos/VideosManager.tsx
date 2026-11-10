"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

type MaterialOption = { id: string; title: string; published: boolean };
type VideoItem = { id: string; materialId: string; title: string; description: string | null; videoUrl: string; duration: string | null; order: number; material: { title: string; published: boolean } };
type VideoForm = { materialId: string; title: string; description: string; videoUrl: string; duration: string; order: string };
const EMPTY: VideoForm = { materialId: "", title: "", description: "", videoUrl: "", duration: "", order: "0" };

export function VideosManager({ videos, materials }: { videos: VideoItem[]; materials: MaterialOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState<VideoForm>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visibleVideos = useMemo(() => videos.filter((v) => `${v.title} ${v.material.title}`.toLocaleLowerCase("id-ID").includes(query.toLocaleLowerCase("id-ID"))), [videos, query]);
  const setField = (key: keyof VideoForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function edit(video: VideoItem) {
    setEditingId(video.id);
    setForm({ materialId: video.materialId, title: video.title, description: video.description ?? "", videoUrl: video.videoUrl, duration: video.duration ?? "", order: String(video.order) });
    setError(""); setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/videos", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, order: Number(form.order), ...(editingId ? { id: editingId } : {}) }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Video belum berhasil disimpan."); return; }
      setForm(EMPTY); setEditingId(null); setMessage(editingId ? "Perubahan video tersimpan." : "Video berhasil ditambahkan."); router.refresh();
    } catch { setError("Koneksi gagal. Periksa jaringan lalu coba lagi."); }
    finally { setPending(false); }
  }

  async function remove(video: VideoItem) {
    if (!window.confirm(`Hapus video “${video.title}”? Progres menonton terkait juga akan dihapus.`)) return;
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/videos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: video.id }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Video belum berhasil dihapus."); return; }
      if (editingId === video.id) { setEditingId(null); setForm(EMPTY); }
      setMessage("Video berhasil dihapus."); router.refresh();
    } catch { setError("Koneksi gagal. Silakan coba lagi."); }
    finally { setPending(false); }
  }

  const fieldClass = "input";
  return <div className="space-y-6">
    <form onSubmit={save} className="card space-y-4">
      <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">{editingId ? "Ubah video" : "Tambah video"}</h2><p className="mt-1 text-sm text-slate-500">Masukkan tautan video yang bisa diputar di halaman pembelajaran.</p></div>{editingId && <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }} aria-label="Batal mengubah video"><X className="h-4 w-4" /> Batal</button>}</div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700">Materi<select className={fieldClass} required value={form.materialId} onChange={(e) => setField("materialId", e.target.value)}><option value="">Pilih materi</option>{materials.map((m) => <option key={m.id} value={m.id}>{m.title}{m.published ? "" : " (disembunyikan)"}</option>)}</select></label>
        <label className="space-y-1 text-sm font-medium text-slate-700">Judul video<input className={fieldClass} required minLength={3} maxLength={160} value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Judul pembelajaran" /></label>
        <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">URL video<input type="url" className={fieldClass} required value={form.videoUrl} onChange={(e) => setField("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></label>
        <label className="space-y-1 text-sm font-medium text-slate-700">Durasi (opsional)<input className={fieldClass} maxLength={40} value={form.duration} onChange={(e) => setField("duration", e.target.value)} placeholder="10 menit" /></label>
        <label className="space-y-1 text-sm font-medium text-slate-700">Urutan<input type="number" min="0" max="10000" className={fieldClass} value={form.order} onChange={(e) => setField("order", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">Deskripsi (opsional)<textarea className={`${fieldClass} resize-y`} maxLength={1000} rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} /></label>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      <button disabled={pending || materials.length === 0} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"><Plus className="h-4 w-4" />{pending ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah video"}</button>
      {materials.length === 0 && <p className="text-sm text-amber-700">Buat materi terlebih dahulu sebelum menambahkan video.</p>}
    </form>
    <section className="card space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-slate-900">Daftar video</h2><p className="text-sm text-slate-500">{videos.length} video terdaftar.</p></div><div className="relative sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input pl-10" aria-label="Cari video" placeholder="Cari judul atau materi" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
      {visibleVideos.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Tidak ada video yang cocok.</p> : <div className="space-y-3">{visibleVideos.map((video) => <article key={video.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{video.title}</h3><span className={`badge ${video.material.published ? "badge-primary" : "bg-amber-100 text-amber-800"}`}>{video.material.published ? "Materi terbit" : "Materi disembunyikan"}</span></div><p className="mt-1 text-sm text-slate-600">{video.material.title}{video.duration ? ` · ${video.duration}` : ""} · Urutan {video.order}</p><a href={video.videoUrl} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-sage-700 underline">{video.videoUrl}</a></div>
        <div className="flex shrink-0 gap-2"><button type="button" className="btn-secondary text-sm" disabled={pending} onClick={() => edit(video)}><Pencil className="h-4 w-4" /> Ubah</button><button type="button" className="btn-secondary text-sm text-red-700" disabled={pending} onClick={() => remove(video)}><Trash2 className="h-4 w-4" /> Hapus</button></div>
      </article>)}</div>}
    </section>
  </div>;
}
