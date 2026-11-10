import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi, hashPassword, verifyPassword, createSession } from "@/lib/auth";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(2).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").optional(),
  })
  .refine((d) => d.name !== undefined || d.newPassword !== undefined, {
    message: "Tidak ada perubahan",
  });

/**
 * PATCH /api/profil — perbarui nama dan/atau ganti password milik pengguna login.
 * Ganti password wajib menyertakan password saat ini dan mencabut sesi di perangkat lain.
 */
export async function PATCH(req: Request) {
  const auth = await requireApi();
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }

  const data: { name?: string; passwordHash?: string } = {};
  if (parsed.data.name) data.name = parsed.data.name;

  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Password saat ini wajib diisi" }, { status: 400 });
    }
    const full = await db.user.findUnique({ where: { id: auth.user.id } });
    if (!full) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    const ok = await verifyPassword(parsed.data.currentPassword, full.passwordHash);
    if (!ok) return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
    data.passwordHash = await hashPassword(parsed.data.newPassword);
  }

  const user = await db.user.update({
    where: { id: auth.user.id },
    data: parsed.data.newPassword ? { ...data, tokenVersion: { increment: 1 } } : data,
  });
  // Reissue this browser's session at the new version; every other session is revoked.
  if (parsed.data.newPassword) {
    await createSession(user.id, user.role, user.tokenVersion);
  }
  const { passwordHash: _ph, ...safe } = user;
  return NextResponse.json({ ok: true, user: safe });
}
