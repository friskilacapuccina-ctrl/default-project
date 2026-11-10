"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { MaterialBody, MaterialObjectives } from "@/components/MaterialLearningContent";
import { MaterialArtwork } from "@/components/MaterialArtwork";

type MaterialItem = {
  id: string;
  order: number;
  title: string;
  slug: string;
  description: string;
  learningObjectives: string;
  content: string;
  published: boolean;
};

type MaterialDraft = Pick<MaterialItem, "title" | "description" | "learningObjectives" | "content">;
const blankDraft = (): MaterialDraft => ({ title: "", description: "", learningObjectives: "", content: "" });

export function MaterialManager({ materials }: { materials: MaterialItem[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MaterialDraft>(blankDraft);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function addMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          learningObjectives: form.get("learningObjectives"),
          content: form.get("content"),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Materi belum berhasil ditambahkan.");
        return;
      }

      formElement.reset();
      setNotice("Materi berhasil ditambahkan dan sekarang tampil di daftar materi.");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Periksa jaringan lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  function beginEdit(material: MaterialItem) {
    setEditingId(material.id);
    setEditDraft({ title: material.title, description: material.description, learningObjectives: material.learningObjectives, content: material.content });
    setError("");
    setNotice("");
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, material: MaterialItem) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Perubahan materi belum berhasil disimpan.");
        return;
      }
      setEditingId(null);
      setNotice("Perubahan materi berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Periksa jaringan lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function deleteMaterial(material: MaterialItem) {
    const confirmed = window.confirm(
      `Hapus materi “${material.title}”? Video dan progres belajar siswa yang terkait juga akan terhapus.`
    );
    if (!confirmed) return;

    setDeletingId(material.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Materi belum berhasil dihapus.");
        return;
      }

      if (viewingId === material.id) setViewingId(null);
      if (editingId === material.id) setEditingId(null);
      setNotice("Materi berhasil dihapus.");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Periksa jaringan lalu coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  async function togglePublished(material: MaterialItem) {
    setPublishingId(material.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !material.published }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Status materi belum berhasil diubah.");
        return;
      }
      setNotice(material.published ? "Materi disembunyikan dari siswa dan dapat diterbitkan kembali." : "Materi diterbitkan kembali untuk siswa.");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setPublishingId(null);
    }
  }

  const setDraftField = (field: keyof MaterialDraft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-[#3b2629] dark:text-[#f0b8ad]">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-900 dark:bg-[#203328] dark:text-[#d7e3d1]">{notice}</p>}

      <details className="card group">
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#d3e4bf]"><Plus className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">Tambah materi</span><span className="block text-sm text-slate-500">Materi baru akan langsung masuk ke daftar di bawah.</span></span>
          <span className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" />Tambah</span>
        </summary>
        <form onSubmit={addMaterial} className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-[#304636]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">Judul materi<input name="title" required minLength={3} maxLength={160} className="input" placeholder="Contoh: Sistem Ekskresi Manusia" /></label>
            <label className="space-y-1 text-sm font-medium text-slate-700">Deskripsi singkat<input name="description" required maxLength={1000} className="input" placeholder="Ringkasan materi" /></label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-slate-700">Tujuan pembelajaran<textarea name="learningObjectives" required maxLength={5000} rows={3} className="input resize-y" placeholder="Tuliskan tujuan yang ingin dicapai siswa" /></label>
          <label className="block space-y-1 text-sm font-medium text-slate-700">Isi materi<textarea name="content" required maxLength={30000} rows={8} className="input resize-y" placeholder="Tuliskan isi materi. Format Markdown dapat digunakan." /></label>
          <button type="submit" disabled={pending} className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"><Plus className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan materi"}</button>
        </form>
      </details>

      <section className="space-y-3" aria-labelledby="materials-heading">
        <div className="flex items-center justify-between gap-3">
          <div><h2 id="materials-heading" className="text-lg font-bold text-slate-900">Daftar Materi</h2><p className="text-sm text-slate-500">Lihat isi dan atur materi dari satu tempat.</p></div>
          <span className="badge badge-neutral">{materials.length} materi</span>
        </div>

        {materials.length === 0 ? (
          <div className="card py-10 text-center text-sm text-slate-500">Belum ada materi. Buka formulir “Tambah materi” untuk membuat materi pertama.</div>
        ) : <div className="grid gap-4 lg:grid-cols-2">{materials.map((material) => (
          <article key={material.id} className="card flex h-full flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <MaterialArtwork order={material.order} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sage-100 px-2.5 py-1 text-xs font-semibold text-sage-800 dark:bg-[#294532] dark:text-[#dce9c9]">Materi {material.order}</span>
                  <button type="button" onClick={() => togglePublished(material)} disabled={publishingId !== null} title={material.published ? "Sembunyikan dari siswa" : "Tampilkan kepada siswa"} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${material.published ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-[#294532] dark:text-[#cfe0b9]" : "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-[#3b3323] dark:text-[#e9d39c]"}`}>
                    {material.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{publishingId === material.id ? "Menyimpan..." : material.published ? "Tampil untuk siswa" : "Disembunyikan"}
                  </button>
                </div>
                <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900">{material.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">{material.description}</p>
                <p className="mt-2 truncate text-xs text-slate-500">/{material.slug}</p>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-[#304636]">
              <button type="button" onClick={() => { setViewingId(viewingId === material.id ? null : material.id); setEditingId(null); }} className="btn-secondary btn-sm inline-flex flex-1 items-center justify-center gap-1.5"><Eye className="h-4 w-4" />{viewingId === material.id ? "Tutup" : "Lihat isi"}</button>
              <button type="button" onClick={() => { if (editingId === material.id) setEditingId(null); else beginEdit(material); setViewingId(null); }} className="btn-secondary btn-sm inline-flex flex-1 items-center justify-center gap-1.5"><Pencil className="h-4 w-4" />{editingId === material.id ? "Batal" : "Edit"}</button>
              <button type="button" onClick={() => deleteMaterial(material)} disabled={deletingId !== null} className="btn-secondary btn-sm inline-flex flex-1 items-center justify-center gap-1.5 border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-[#624139] dark:text-[#f0b8ad] dark:hover:bg-[#3a2824]" aria-label={`Hapus materi ${material.title}`}><Trash2 className="h-4 w-4" />{deletingId === material.id ? "Menghapus..." : "Hapus"}</button>
            </div>

            {viewingId === material.id && <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-[#304636]">
              <section><h3 className="text-sm font-semibold text-slate-900">Tujuan pembelajaran</h3><div className="mt-1 space-y-2 rounded-xl bg-sage-50/70 p-4 text-sm leading-relaxed text-slate-700 dark:bg-[#203328] dark:text-[#d6e1d1]"><MaterialObjectives slug={material.slug} objectives={material.learningObjectives} /></div></section>
              <section><h3 className="text-sm font-semibold text-slate-900">Isi materi</h3><div className="prose prose-sm mt-1 max-h-[32rem] max-w-none overflow-y-auto rounded-xl bg-sage-50/70 p-4 dark:bg-[#203328]"><MaterialBody slug={material.slug} title={material.title} content={material.content} /></div></section>
            </div>}

            {editingId === material.id && <form onSubmit={(event) => saveEdit(event, material)} className="space-y-4 border-t border-slate-100 pt-4 dark:border-[#304636]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">Judul materi<input value={editDraft.title} onChange={setDraftField("title")} required minLength={3} maxLength={160} className="input" /></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Deskripsi singkat<input value={editDraft.description} onChange={setDraftField("description")} required maxLength={1000} className="input" /></label>
              </div>
              <label className="block space-y-1 text-sm font-medium text-slate-700">Tujuan pembelajaran<textarea value={editDraft.learningObjectives} onChange={setDraftField("learningObjectives")} required maxLength={5000} rows={3} className="input resize-y" /></label>
              <label className="block space-y-1 text-sm font-medium text-slate-700">Isi materi<textarea value={editDraft.content} onChange={setDraftField("content")} required maxLength={30000} rows={8} className="input resize-y" /></label>
              <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setEditingId(null)} className="btn-secondary inline-flex items-center gap-2"><X className="h-4 w-4" />Batal</button><button type="submit" disabled={pending} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"><Save className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan perubahan"}</button></div>
            </form>}
          </article>
        ))}</div>}
      </section>
    </div>
  );
}
