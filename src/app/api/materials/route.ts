import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const createSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(1).max(1000),
  learningObjectives: z.string().trim().min(1).max(5000),
  content: z.string().trim().min(1).max(30000),
});

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "materi-baru";
}

/** POST /api/materials — guru dapat menambahkan materi. */
export async function POST(req: Request) {
  const auth = await requireApi(["TEACHER"]);
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Lengkapi judul, deskripsi, tujuan, dan isi materi dengan benar." }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let suffix = 2;
  while (await db.material.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const latest = await db.material.aggregate({ _max: { order: true } });
  try {
    const material = await db.material.create({
      data: {
        ...parsed.data,
        slug,
        order: (latest._max.order ?? 0) + 1,
        published: true,
      },
      select: { id: true, title: true, slug: true, order: true },
    });

    await writeAuditLog({
      actorId: auth.user.id,
      action: "MATERIAL_CREATE",
      targetType: "MATERIAL",
      targetId: material.id,
      detail: { title: material.title, slug: material.slug },
    });

    return NextResponse.json({ ok: true, material }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Materi gagal dibuat. Coba lagi." }, { status: 409 });
  }
}
