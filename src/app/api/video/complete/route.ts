import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ videoId: z.string().min(1) });

/** Tandai video selesai untuk pengguna login (kepemilikan dari sesi, bukan body). */
export async function POST(req: Request) {
  const auth = await requireApi(["STUDENT"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const video = await db.video.findFirst({ where: { id: parsed.data.videoId, material: { published: true } } });
  if (!video) return NextResponse.json({ error: "Video tidak ditemukan" }, { status: 404 });
  await db.videoProgress.upsert({
    where: { userId_videoId: { userId: auth.user.id, videoId: parsed.data.videoId } },
    update: { completed: true, watchedAt: new Date() },
    create: { userId: auth.user.id, videoId: parsed.data.videoId, completed: true, watchedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
