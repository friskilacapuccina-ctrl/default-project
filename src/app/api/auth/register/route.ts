import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

/**
 * Registrasi publik HANYA untuk siswa. Field `role` dari body tidak pernah
 * diproses — akun guru/admin dibuat oleh admin terautentikasi atau seed.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }
  const { name, username, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);
  const exists = await db.user.findFirst({
    where: { OR: [{ username: { equals: username, mode: "insensitive" } }, { email: { equals: email, mode: "insensitive" } }] },
    select: { username: true, email: true },
  }).catch(() => null);
  if (exists) {
    const field = exists.username.toLowerCase() === username ? "Username" : "Email";
    return NextResponse.json({ error: `${field} sudah digunakan` }, { status: 409 });
  }

  let user;
  try {
    user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { name, username, email, passwordHash, role: "STUDENT" } });
      const studentCode = await (async () => {
        for (let attempt = 0; attempt < 10; attempt++) {
          const candidate = `SW-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
          const codeExists = await tx.studentProfile.findUnique({ where: { studentCode: candidate }, select: { id: true } });
          if (!codeExists) return candidate;
        }
        throw new Error("Could not allocate a student code.");
      })();
      await tx.studentProfile.create({ data: { userId: created.id, studentCode } });
      return created;
    });
  } catch (error) {
    // The unique constraint is the final guard against simultaneous registrations.
    const duplicate = await db.user.findFirst({
      where: { OR: [{ username: { equals: username, mode: "insensitive" } }, { email: { equals: email, mode: "insensitive" } }] },
      select: { username: true, email: true },
    }).catch(() => null);
    if (duplicate) {
      const field = duplicate.username.toLowerCase() === username ? "Username" : "Email";
      return NextResponse.json({ error: `${field} sudah digunakan` }, { status: 409 });
    }
    console.error("[auth/register] Account creation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Akun gagal dibuat. Silakan coba lagi." }, { status: 503 });
  }
  await createSession(user.id, user.role, user.tokenVersion);
  return NextResponse.json({ ok: true });
}
