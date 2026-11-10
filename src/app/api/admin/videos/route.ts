import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const videoFields = {
  materialId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  videoUrl: z.string().url().max(2000),
  duration: z.string().trim().max(40).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).max(10000).optional(),
};
const createSchema = z.object(videoFields);
const updateSchema = z.object({
  id: z.string().min(1),
  materialId: videoFields.materialId.optional(),
  title: videoFields.title.optional(),
  description: videoFields.description.optional(),
  videoUrl: videoFields.videoUrl.optional(),
  duration: videoFields.duration.optional(),
  order: videoFields.order.optional(),
}).refine((data) => Object.keys(data).some((key) => key !== "id"), "Tidak ada perubahan.");
const deleteSchema = z.object({ id: z.string().min(1) });

export async function POST(req: Request) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Lengkapi judul, materi, dan URL video yang valid." }, { status: 400 });
  const material = await db.material.findUnique({ where: { id: parsed.data.materialId }, select: { id: true } });
  if (!material) return NextResponse.json({ error: "Materi yang dipilih tidak ditemukan." }, { status: 404 });
  const video = await db.video.create({
    data: { ...parsed.data, description: parsed.data.description || null, duration: parsed.data.duration || null, order: parsed.data.order ?? 0 },
    select: { id: true, title: true },
  });
  await writeAuditLog({ actorId: auth.user.id, action: "VIDEO_CREATE", targetType: "VIDEO", targetId: video.id, detail: { title: video.title } });
  return NextResponse.json({ ok: true, video }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data perubahan tidak valid." }, { status: 400 });
  const { id, ...input } = parsed.data;
  const existing = await db.video.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!existing) return NextResponse.json({ error: "Video tidak ditemukan." }, { status: 404 });
  if (input.materialId && !(await db.material.findUnique({ where: { id: input.materialId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Materi yang dipilih tidak ditemukan." }, { status: 404 });
  }
  const data: {materialId?:string;title?:string;description?:string|null;videoUrl?:string;duration?:string|null;order?:number} = { ...input };
  if (input.description !== undefined) data.description = input.description || null;
  if (input.duration !== undefined) data.duration = input.duration || null;
  const updated = await db.video.update({ where: { id }, data, select: { id: true, title: true } });
  await writeAuditLog({ actorId: auth.user.id, action: "VIDEO_UPDATE", targetType: "VIDEO", targetId: id, detail: { before: existing.title, after: updated.title } });
  return NextResponse.json({ ok: true, video: updated });
}

export async function DELETE(req: Request) {
  const auth = await requireApi(["TEACHER", "ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Video tidak valid." }, { status: 400 });
  const video = await db.video.findUnique({ where: { id: parsed.data.id }, select: { id: true, title: true } });
  if (!video) return NextResponse.json({ error: "Video tidak ditemukan." }, { status: 404 });
  await db.video.delete({ where: { id: video.id } });
  await writeAuditLog({ actorId: auth.user.id, action: "VIDEO_DELETE", targetType: "VIDEO", targetId: video.id, detail: { title: video.title } });
  return NextResponse.json({ ok: true });
}
