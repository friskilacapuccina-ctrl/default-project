"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Video } from "lucide-react";
import { youtubeEmbed } from "@/lib/utils";

export type AdminVideo = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: string | null;
  material: { title: string; published: boolean };
};

export function VideosViewer({ videos }: { videos: AdminVideo[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function remove(video: AdminVideo) {
    if (!window.confirm(`Hapus video “${video.title}”? Progres menonton siswa yang terkait juga akan dihapus.`)) return;
    setDeletingId(video.id);
    setError("");
    try {
      const response = await fetch("/api/admin/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Video belum berhasil dihapus.");
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
    <section className="card space-y-4" aria-label="Daftar video pembelajaran">
      <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">Daftar video</h2><span className="text-sm text-slate-500">{videos.length} video</span></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-[#3b2629] dark:text-[#f0b8ad]">{error}</p>}
      {videos.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Belum ada video.</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{videos.map((video) => (
        <article key={video.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#304636]">
          <div className="aspect-video bg-slate-950">
            <iframe src={youtubeEmbed(video.videoUrl)} title={video.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy" />
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-start gap-2"><Video className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" /><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{video.title}</h3><p className="mt-1 text-sm text-slate-600">{video.material.title}{video.duration ? ` · ${video.duration}` : ""}</p></div><span className={`badge ${video.material.published ? "badge-primary" : "badge-neutral"}`}>{video.material.published ? "Terbit" : "Draft"}</span></div>
            {video.description && <p className="text-sm leading-relaxed text-slate-600">{video.description}</p>}
            <button type="button" onClick={() => remove(video)} disabled={deletingId !== null} className="btn-secondary inline-flex items-center gap-2 border-red-200 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-[#624139] dark:text-[#f0b8ad] dark:hover:bg-[#3a2824]">
              <Trash2 className="h-4 w-4" />{deletingId === video.id ? "Menghapus..." : "Hapus video"}
            </button>
          </div>
        </article>
      ))}</div>}
    </section>
  );
}
