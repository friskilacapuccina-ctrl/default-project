import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({ id: z.string().min(1), published: z.boolean() });

/** PATCH /api/admin/materials — guru mengelola publikasi materi. */
export async function PATCH(req: Request) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const existing = await db.material.findUnique({ where: { id: parsed.data.id }, select: { id: true, slug: true, title: true } });
  if (!existing) return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });
  const material = await db.material.update({ where: { id: parsed.data.id }, data: { published: parsed.data.published } });
  await writeAuditLog({
    actorId: auth.user.id,
    action: parsed.data.published ? "MATERIAL_PUBLISH" : "MATERIAL_UNPUBLISH",
    targetType: "MATERIAL",
    targetId: material.id,
    detail: { slug: material.slug, published: material.published },
  });
  return NextResponse.json({ ok: true });
}
