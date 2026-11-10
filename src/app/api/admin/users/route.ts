import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi, hashPassword, ensureProfileForUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const ROLES = ["ADMIN", "TEACHER", "STUDENT"] as const;

const createSchema = z.object({
  name: z.string().trim().min(2),
  username: z.string().trim().toLowerCase().min(3).regex(/^[a-z0-9_.]+$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
});

const patchSchema = z.object({
  id: z.string().min(1),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/users — daftar pengguna (hanya admin). */
export async function GET() {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      teacherProfile: { select: { teacherCode: true, subject: true } },
      studentProfile: { select: { studentCode: true, className: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ users });
}

/** POST /api/admin/users — buat akun (guru/admin/siswa) oleh admin. */
export async function POST(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const exists = await db.user.findFirst({ where: { OR: [
    { username: { equals: parsed.data.username, mode: "insensitive" } },
    { email: { equals: parsed.data.email, mode: "insensitive" } },
  ] } });
  if (exists) return NextResponse.json({ error: "Username/email sudah dipakai" }, { status: 400 });
  const u = await db.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  await ensureProfileForUser({ id: u.id, role: u.role });
  await writeAuditLog({
    actorId: auth.user.id,
    action: "USER_CREATE",
    targetType: "USER",
    targetId: u.id,
    detail: { username: u.username, role: u.role },
  });
  return NextResponse.json({ ok: true, id: u.id });
}

/**
 * PATCH /api/admin/users — ubah role dan/atau aktifkan/nonaktifkan akun.
 * - Admin tidak dapat mengubah role/menonaktifkan dirinya sendiri.
 * - Perubahan sensitif menaikkan tokenVersion sehingga seluruh sesi lama
 *   pengguna target langsung mati, dan dicatat ke audit log.
 */
export async function PATCH(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const { id, role, isActive } = parsed.data;
  if (role === undefined && isActive === undefined) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  if (target.id === auth.user.id && (role !== undefined && role !== target.role || isActive === false)) {
    return NextResponse.json({ error: "Anda tidak dapat mengubah role/menonaktifkan akun sendiri" }, { status: 400 });
  }
  // Jangan biarkan sistem kehilangan admin terakhir.
  if (target.role === "ADMIN" && (role !== undefined && role !== "ADMIN" || isActive === false)) {
    const otherAdmins = await db.user.count({ where: { role: "ADMIN", isActive: true, id: { not: target.id } } });
    if (otherAdmins === 0) return NextResponse.json({ error: "Tidak dapat menonaktifkan/menurunkan admin terakhir" }, { status: 400 });
  }

  const sensitive =
    (role !== undefined && role !== target.role) ||
    (isActive !== undefined && isActive !== target.isActive);
  const data: { role?: "ADMIN" | "TEACHER" | "STUDENT"; isActive?: boolean; tokenVersion?: number } = {};
  if (role !== undefined && role !== target.role) data.role = role;
  if (isActive !== undefined && isActive !== target.isActive) data.isActive = isActive;
  if (sensitive) data.tokenVersion = target.tokenVersion + 1;

  const updated = await db.user.update({ where: { id }, data });
  if (role !== undefined && role !== target.role) await ensureProfileForUser({ id, role });

  await writeAuditLog({
    actorId: auth.user.id,
    action: "USER_UPDATE",
    targetType: "USER",
    targetId: id,
    detail: {
      username: target.username,
      roleBefore: target.role,
      roleAfter: updated.role,
      isActiveBefore: target.isActive,
      isActiveAfter: updated.isActive,
    },
  });
  return NextResponse.json({ ok: true, role: updated.role, isActive: updated.isActive });
}
