import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const editSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(1).max(1000),
  learningObjectives: z.string().trim().min(1).max(5000),
  content: z.string().trim().min(1).max(30000),
});

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "materi";
}

/** Sembunyikan/pulihkan materi tanpa menghapus progres siswa. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;
  const body = await req.json().catch(() => null);
  const edit = editSchema.safeParse(body);
  if (edit.success) {
    const existing = await db.material.findUnique({ where: { id: params.id }, select: { id: true, title: true, slug: true } });
    if (!existing) return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });

    const baseSlug = slugify(edit.data.title);
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const collision = await db.material.findUnique({ where: { slug }, select: { id: true } });
      if (!collision || collision.id === existing.id) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const updated = await db.material.update({ where: { id: existing.id }, data: { ...edit.data, slug } });
    await writeAuditLog({ actorId: auth.user.id, action: "MATERIAL_UPDATE", targetType: "MATERIAL", targetId: updated.id, detail: { titleBefore: existing.title, titleAfter: updated.title, slug: updated.slug } });
    return NextResponse.json({ ok: true });
  }
  if (typeof body?.published !== "boolean") {
    return NextResponse.json({ error: "Status publikasi tidak valid." }, { status: 400 });
  }
  const material = await db.material.findUnique({ where: { id: params.id }, select: { id: true, title: true, published: true } });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });
  const updated = await db.material.update({ where: { id: material.id }, data: { published: body.published } });
  await writeAuditLog({
    actorId: auth.user.id,
    action: body.published ? "MATERIAL_PUBLISH" : "MATERIAL_UNPUBLISH",
    targetType: "MATERIAL",
    targetId: material.id,
    detail: { title: material.title },
  });
  return NextResponse.json({ ok: true, published: updated.published });
}

/** Guru dan admin dapat menghapus materi; konten/progres terkait ikut terhapus. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApi(["TEACHER", "ADMIN"]);
  if (auth.response) return auth.response;

  const material = await db.material.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, slug: true },
  });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });

  await db.material.delete({ where: { id: material.id } });
  await writeAuditLog({
    actorId: auth.user.id,
    action: "MATERIAL_DELETE",
    targetType: "MATERIAL",
    targetId: material.id,
    detail: { title: material.title, slug: material.slug },
  });

  return NextResponse.json({ ok: true });
}
