import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { TeacherVideosManager } from "./TeacherVideosManager";
import { Video } from "lucide-react";

export default async function TeacherVideosPage() {
  const [videos, materials] = await Promise.all([
    db.video.findMany({
      orderBy: [{ material: { order: "asc" } }, { order: "asc" }],
      select: { id: true, materialId: true, title: true, description: true, videoUrl: true, duration: true, order: true, material: { select: { title: true, published: true } } },
    }),
    db.material.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true, published: true } }),
  ]);

  return (
    <AppShell allow={["TEACHER"]}>
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#d3e4bf]"><Video className="h-6 w-6" /></span>
        <div><h1 className="text-2xl font-bold text-slate-900">Video Pembelajaran</h1><p className="mt-1 text-sm text-slate-500">Tambahkan video, lihat pratinjau, atau hapus video dari daftar.</p></div>
      </div>
      <TeacherVideosManager videos={videos} materials={materials} />
    </AppShell>
  );
}
