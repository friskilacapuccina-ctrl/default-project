"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2 } from "lucide-react";
import { MaterialArtwork } from "@/components/MaterialArtwork";
import { MaterialBody, MaterialObjectives } from "@/components/MaterialLearningContent";

export type AdminMaterial = {
  id: string;
  order: number;
  slug: string;
  title: string;
  description: string;
  learningObjectives: string;
  content: string;
  published: boolean;
};

export function MaterialsViewer({ materials }: { materials: AdminMaterial[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function remove(material: AdminMaterial) {
    if (!window.confirm(`Hapus materi “${material.title}”? Video dan progres materi siswa yang terkait juga akan terhapus.`)) return;
    setDeletingId(material.id);
    setError("");
    try {
      const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Materi belum berhasil dihapus.");
        return;
      }
      router.refresh();
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="card space-y-3" aria-label="Daftar materi pembelajaran">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">Daftar materi</h2>
        <span className="text-sm text-slate-500">{materials.length} materi</span>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-[#3b2629] dark:text-[#f0b8ad]">{error}</p>}
      {materials.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Belum ada materi.</p> : materials.map((material) => (
        <details key={material.id} className="group rounded-xl border border-slate-200 p-4 dark:border-[#304636]">
          <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
            <MaterialArtwork order={material.order} />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-slate-900">Materi {material.order} · {material.title}</span>
              <span className="mt-0.5 block text-sm text-slate-600">{material.description}</span>
            </span>
            <span className={`badge ${material.published ? "badge-primary" : "badge-neutral"}`}>{material.published ? "Terbit" : "Draft"}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 dark:border-[#304636]">
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Tujuan pembelajaran</h3>
              <div className="mt-1 space-y-2 text-sm leading-relaxed text-slate-700"><MaterialObjectives slug={material.slug} objectives={material.learningObjectives} /></div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-slate-900">Isi materi</h3>
              <div className="mt-1 max-h-[32rem] overflow-y-auto rounded-lg bg-sage-50/70 p-4 text-sm leading-7 text-slate-700 dark:bg-[#203328] dark:text-[#d6e1d1]">
                <MaterialBody slug={material.slug} title={material.title} content={material.content} />
              </div>
            </section>
            <div className="flex justify-end border-t border-slate-100 pt-3 dark:border-[#304636]">
              <button type="button" onClick={() => remove(material)} disabled={deletingId !== null} className="btn-secondary inline-flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-[#624139] dark:text-[#f0b8ad] dark:hover:bg-[#3a2824]">
                <Trash2 className="h-4 w-4" />{deletingId === material.id ? "Menghapus..." : "Hapus materi"}
              </button>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}
