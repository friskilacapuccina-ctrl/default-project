"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ExternalLink, Eye, Pencil, Plus, Save, Trash2, Video, X } from "lucide-react";
import { youtubeEmbed } from "@/lib/utils";

type MaterialOption = { id: string; title: string; published: boolean };
type VideoItem = {
  id: string;
  materialId: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: string | null;
  order: number;
  material: { title: string; published: boolean };
};
type VideoDraft = { materialId: string; title: string; description: string; videoUrl: string; duration: string; order: string };
const emptyDraft = (): VideoDraft => ({ materialId: "", title: "", description: "", videoUrl: "", duration: "", order: "0" });

export function TeacherVideosManager({ videos, materials }: { videos: VideoItem[]; materials: MaterialOption[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<VideoDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const setField = (field: keyof VideoDraft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  function edit(video: VideoItem) {
    setEditingId(video.id);
    setDraft({ materialId: video.materialId, title: video.title, description: video.description ?? "", videoUrl: video.videoUrl, duration: video.duration ?? "", order: String(video.order) });
    setViewingId(null);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft());
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/videos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, order: Number(draft.order), ...(editingId ? { id: editingId } : {}) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Video belum berhasil disimpan."); return; }
      setDraft(emptyDraft());
      setEditingId(null);
      setNotice(editingId ? "Perubahan video berhasil disimpan." : "Video berhasil ditambahkan dan masuk ke daftar.");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Periksa jaringan lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function remove(video: VideoItem) {
    if (!window.confirm(`Hapus video “${video.title}”? Progres menonton siswa yang terkait juga akan terhapus.`)) return;
    setDeletingId(video.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/videos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: video.id }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Video belum berhasil dihapus."); return; }
      if (editingId === video.id) cancelEdit();
      if (viewingId === video.id) setViewingId(null);
      setNotice("Video berhasil dihapus.");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-[#3b2629] dark:text-[#f0b8ad]">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-900 dark:bg-[#203328] dark:text-[#d7e3d1]">{notice}</p>}

      <details className="card group" open={Boolean(editingId)}>
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#d3e4bf]">{editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</span>
          <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">{editingId ? "Edit video" : "Tambah video"}</span><span className="block text-sm text-slate-500">Hubungkan video dengan materi yang sesuai.</span></span>
          <span className="btn-primary inline-flex items-center gap-2">{editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingId ? "Edit" : "Tambah"}</span>
        </summary>
        <form onSubmit={save} className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-[#304636]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">Materi terkait<select className="input" required value={draft.materialId} onChange={setField("materialId")}><option value="">Pilih materi</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.title}{material.published ? "" : " · disembunyikan"}</option>)}</select></label>
            <label className="space-y-1 text-sm font-medium text-slate-700">Judul video<input className="input" required minLength={3} maxLength={160} value={draft.title} onChange={setField("title")} placeholder="Contoh: Sistem pencernaan manusia" /></label>
            <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">Tautan video<input type="url" className="input" required maxLength={2000} value={draft.videoUrl} onChange={setField("videoUrl")} placeholder="https://www.youtube.com/watch?v=..." /></label>
            <label className="space-y-1 text-sm font-medium text-slate-700">Durasi (opsional)<input className="input" maxLength={40} value={draft.duration} onChange={setField("duration")} placeholder="10 menit" /></label>
            <label className="space-y-1 text-sm font-medium text-slate-700">Urutan tampil<input type="number" min="0" max="10000" className="input" value={draft.order} onChange={setField("order")} /></label>
            <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">Deskripsi (opsional)<textarea className="input resize-y" maxLength={1000} rows={2} value={draft.description} onChange={setField("description")} placeholder="Keterangan singkat isi video" /></label>
          </div>
          {materials.length === 0 && <p className="text-sm text-amber-700 dark:text-[#e5c78c]">Tambahkan materi terlebih dahulu sebelum menghubungkan video.</p>}
          <div className="flex flex-wrap justify-end gap-2">
            {editingId && <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={cancelEdit}><X className="h-4 w-4" />Batal</button>}
            <button disabled={pending || materials.length === 0} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">{editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{pending ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah video"}</button>
          </div>
        </form>
      </details>

      <section className="space-y-3" aria-labelledby="teacher-videos-heading">
        <div className="flex items-center justify-between gap-3"><div><h2 id="teacher-videos-heading" className="text-lg font-bold text-slate-900">Daftar Video</h2><p className="text-sm text-slate-500">Lihat pratinjau atau atur video pembelajaran.</p></div><span className="badge badge-neutral">{videos.length} video</span></div>
        {videos.length === 0 ? <div className="card py-10 text-center"><Video className="mx-auto mb-3 h-9 w-9 text-sage-600" /><p className="font-medium text-slate-800 dark:text-[#e1eadb]">Belum ada video</p><p className="mt-1 text-sm text-slate-500">Gunakan “Tambah video” untuk memasukkan video pertama.</p></div> : <div className="grid gap-4 xl:grid-cols-2">
          {videos.map((video) => <article key={video.id} className="card space-y-4">
            <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#d3e4bf]"><Video className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{video.title}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><BookOpen className="h-3.5 w-3.5 shrink-0" />{video.material.title}</p><p className="mt-1 text-xs text-slate-500">{video.duration || "Durasi tidak dicantumkan"} · Urutan {video.order}</p></div><span className={`badge ${video.material.published ? "badge-primary" : "badge-neutral"}`}>{video.material.published ? "Materi tampil" : "Materi disembunyikan"}</span></div>
            {video.description && <p className="text-sm leading-relaxed text-slate-600 dark:text-[#c6d3c1]">{video.description}</p>}
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-[#304636]">
              <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={() => setViewingId(viewingId === video.id ? null : video.id)}><Eye className="h-4 w-4" />{viewingId === video.id ? "Tutup video" : "Lihat video"}</button>
              <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => edit(video)}><Pencil className="h-4 w-4" />Edit</button>
              <a className="btn-secondary inline-flex items-center gap-2" href={video.videoUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Buka tautan</a>
              <button type="button" className="btn-secondary inline-flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-[#624139] dark:text-[#f0b8ad] dark:hover:bg-[#3a2824]" onClick={() => remove(video)} disabled={deletingId !== null}><Trash2 className="h-4 w-4" />{deletingId === video.id ? "Menghapus..." : "Hapus"}</button>
            </div>
            {viewingId === video.id && <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-[#405747]"><div className="aspect-video"><iframe src={youtubeEmbed(video.videoUrl)} title={video.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy" /></div></div>}
          </article>)}
        </div>}
      </section>
    </div>
  );
}
