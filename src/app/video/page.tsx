import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { youtubeEmbed } from "@/lib/utils";
import { VideoDoneButton } from "./VideoDoneButton";
import {
  Video,
  Clock,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  BookOpen,
} from "lucide-react";

export default async function VideoPage({
  searchParams,
}: {
  searchParams: { highlight?: string };
}) {
  const user = await getCurrentUser();
  const videos = await db.video.findMany({
    where: user?.role === "STUDENT" ? { material: { published: true } } : undefined,
    orderBy: { order: "asc" },
    include: { material: true },
  });
  const done = user
    ? await db.videoProgress.findMany({
        where: { userId: user.id, completed: true },
      })
    : [];
  const doneIds = new Set(done.map((d) => d.videoId));

  return (
    <AppShell allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Video Pembelajaran
            </h1>
            <p className="text-slate-600 mt-1">
              Video pembelajaran kurikulum untuk setiap materi Biologi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Video className="w-4 h-4 text-sage-600" />
              <span>{videos.length} Video Tersedia</span>
            </div>
            {user?.role === "STUDENT" && (
              <div className="badge bg-sage-100 text-sage-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {doneIds.size}/{videos.length} Selesai
                </span>
              </div>
            )}
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="card text-center py-16">
            <Video className="w-16 h-16 text-sage-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Belum Ada Video
            </h3>
            <p className="text-slate-500">Video akan ditambahkan oleh admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, videoIndex) => {
              const isDone = doneIds.has(v.id);
              const isHighlighted = searchParams.highlight === v.id;
              return (
                <div
                  key={v.id}
                  id={v.id}
                  className={`card-hover group relative flex h-full flex-col overflow-hidden ${isHighlighted ? "ring-2 ring-sage-500" : ""}`}
                  style={{ animationDelay: `${videoIndex * 0.05}s` }}
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 relative">
                    <iframe
                      src={youtubeEmbed(v.videoUrl)}
                      title={v.title}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <a
                        href={v.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary group flex items-center gap-2"
                      >
                        <PlayCircle className="w-5 h-5" />
                        <span>Tonton di YouTube</span>
                      </a>
                    </div>
                    {isDone && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Selesai
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-1 flex-col space-y-3">
                    <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{v.material.title}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2">
                      {v.title}
                    </h3>
                    {v.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {v.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{v.duration || "~10 menit"}</span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={v.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary btn-sm group flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>YouTube</span>
                        </a>
                        {user?.role === "STUDENT" &&
                          (isDone ? (
                            <span className="badge badge-success">
                              <CheckCircle2 size={12} /> Selesai
                            </span>
                          ) : (
                            <VideoDoneButton videoId={v.id} />
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
