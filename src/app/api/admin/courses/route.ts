import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const createSchema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().max(1000).optional().or(z.literal("")) });
const updateSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(2).max(120).optional(), description: z.string().trim().max(1000).optional().or(z.literal("")) }).refine((data) => data.name !== undefined || data.description !== undefined);
const deleteSchema = z.object({ id: z.string().min(1) });

export async function POST(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nama course wajib diisi." }, { status: 400 });
  const course = await db.course.create({ data: { name: parsed.data.name, description: parsed.data.description || null } });
  await writeAuditLog({ actorId: auth.user.id, action: "COURSE_CREATE", targetType: "COURSE", targetId: course.id, detail: { name: course.name } });
  return NextResponse.json({ ok: true, course }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Perubahan course tidak valid." }, { status: 400 });
  const current = await db.course.findUnique({ where: { id: parsed.data.id } });
  if (!current) return NextResponse.json({ error: "Course tidak ditemukan." }, { status: 404 });
  const updated = await db.course.update({ where: { id: current.id }, data: { ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}), ...(parsed.data.description !== undefined ? { description: parsed.data.description || null } : {}) } });
  await writeAuditLog({ actorId: auth.user.id, action: "COURSE_UPDATE", targetType: "COURSE", targetId: current.id, detail: { from: current.name, to: updated.name } });
  return NextResponse.json({ ok: true, course: updated });
}

export async function DELETE(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Course tidak valid." }, { status: 400 });
  const course = await db.course.findUnique({ where: { id: parsed.data.id }, include: { _count: { select: { students: true, teachers: true } } } });
  if (!course) return NextResponse.json({ error: "Course tidak ditemukan." }, { status: 404 });
  await db.course.delete({ where: { id: course.id } });
  await writeAuditLog({ actorId: auth.user.id, action: "COURSE_DELETE", targetType: "COURSE", targetId: course.id, detail: { name: course.name, enrollments: course._count.students, teachers: course._count.teachers } });
  return NextResponse.json({ ok: true });
}
