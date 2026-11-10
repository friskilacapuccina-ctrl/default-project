import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ materialId: z.string().min(1) });

/** Catat kemajuan belajar milik pengguna login (tidak bisa ditulis untuk pengguna lain). */
export async function POST(req: Request) {
  const auth = await requireApi();
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const material = await db.material.findFirst({
    where: { id: parsed.data.materialId, ...(auth.user.role === "TEACHER" || auth.user.role === "ADMIN" ? {} : { published: true }) },
  });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });
  const p = await db.progress.upsert({
    where: { userId_materialId: { userId: auth.user.id, materialId: parsed.data.materialId } },
    update: { completed: true, progressPercentage: 100, lastAccessedAt: new Date() },
    create: { userId: auth.user.id, materialId: parsed.data.materialId, completed: true, progressPercentage: 100 },
  });
  return NextResponse.json({ ok: true, progress: p });
}
