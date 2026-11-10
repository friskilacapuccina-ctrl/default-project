import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { VideosViewer } from "./VideosViewer";

export default async function AdminVideos() {
  const videos = await db.video.findMany({
    orderBy: [{ material: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      duration: true,
      material: { select: { title: true, published: true } },
    },
  });

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Video Pembelajaran</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tonton video langsung dari halaman ini. Admin dapat menghapus video yang tidak digunakan.
        </p>
      </div>
      <VideosViewer videos={videos} />
    </AppShell>
  );
}
