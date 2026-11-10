"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export function CreateCourseForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Course belum berhasil dibuat."); return; }
      setName(""); setDescription(""); setNotice("Course berhasil dibuat."); router.refresh();
    } catch { setError("Koneksi gagal. Coba lagi."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="card mb-6 space-y-3">
    <h2 className="font-semibold text-slate-900">Buat course</h2>
    <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
      <label className="space-y-1 text-sm font-medium text-slate-700">Nama kelas<input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Biologi Kelas XI A" minLength={2} maxLength={120} required /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700">Deskripsi (opsional)<input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Keterangan kelas" maxLength={1000} /></label>
      <div className="flex items-end"><button disabled={pending} className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"><Plus className="h-4 w-4" />{pending ? "Menyimpan..." : "Buat kelas"}</button></div>
    </div>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
  </form>;
}

export function CourseActions({ courseId, name, description }: { courseId: string; name: string; description: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nextName, setNextName] = useState(name);
  const [nextDescription, setNextDescription] = useState(description ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch("/api/admin/courses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: courseId, name: nextName, description: nextDescription }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Course belum berhasil diperbarui."); return; }
      setEditing(false); router.refresh();
    } catch { setError("Koneksi gagal. Coba lagi."); }
    finally { setPending(false); }
  }
  async function remove() {
    if (!window.confirm(`Hapus kelas “${name}”? Guru dan siswa akan dikeluarkan dari kelas ini; akun, nilai, dan progres belajar mereka tetap ada.`)) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/admin/courses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: courseId }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Course belum berhasil dihapus."); return; }
      router.refresh();
    } catch { setError("Koneksi gagal. Coba lagi."); }
    finally { setPending(false); }
  }
  if (editing) return <form onSubmit={save} className="mt-3 grid w-full gap-2 sm:grid-cols-[1fr_1.5fr_auto_auto]">
    <input className="input" value={nextName} onChange={(e) => setNextName(e.target.value)} required minLength={2} maxLength={120} aria-label="Nama course" />
    <input className="input" value={nextDescription} onChange={(e) => setNextDescription(e.target.value)} maxLength={1000} placeholder="Deskripsi" aria-label="Deskripsi course" />
    <button className="btn-primary text-sm" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</button>
    <button className="btn-secondary text-sm" type="button" disabled={pending} onClick={() => setEditing(false)}><X className="h-4 w-4" /> Batal</button>
    {error && <p role="alert" className="text-sm text-red-600 sm:col-span-4">{error}</p>}
  </form>;
  return <div className="mt-3 flex items-center justify-end gap-2">
    {error && <p role="alert" className="mr-auto text-sm text-red-600">{error}</p>}
    <button type="button" className="btn-secondary text-sm" disabled={pending} onClick={() => { setNextName(name); setNextDescription(description ?? ""); setEditing(true); }}><Pencil className="h-4 w-4" /> Ubah kelas</button>
    <button type="button" className="btn-secondary text-sm text-red-700" disabled={pending} onClick={remove}><Trash2 className="h-4 w-4" /> Hapus kelas</button>
  </div>;
}
