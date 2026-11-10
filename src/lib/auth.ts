import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";
import { getAuthSecret } from "./authSecret";

const COOKIE = "biolearn_session";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

/** Pengguna aman (tanpa passwordHash) yang sudah diverifikasi dari database. */
export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  tokenVersion: number;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

/**
 * Buat sesi baru. `tokenVersion` ikut ditandatangani ke JWT sehingga
 * saat admin mengubah role / menonaktifkan akun (tokenVersion dinaikkan),
 * seluruh sesi lama langsung tidak berlaku meski JWT-nya belum kedaluwarsa.
 */
export async function createSession(userId: string, role: string, tokenVersion = 0) {
  const token = await new SignJWT({ sub: userId, role, tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/**
 * Verifikasi JWT saja (tanpa query DB). Hanya untuk keperluan ringan —
 * otorisasi SELENYA memakai `requireUser`/`requireApi` yang membaca role
 * terkini dari database, bukan klaim JWT yang bisa basi.
 */
export async function getSession(): Promise<{ userId: string; role: string } | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return { userId: String(payload.sub), role: String(payload.role) };
  } catch {
    return null;
  }
}

/**
 * Otorisasi berbasis database:
 * - token valid,
 * - tokenVersion cocok dengan DB (sesi lama otomatis mati),
 * - akun aktif,
 * - role diambil dari DB (bukan dari klaim JWT).
 * `allowed` opsional: daftar role yang diizinkan.
 */
export async function requireUser(allowed?: Role[]): Promise<SessionUser | null> {
  const s = await getSession();
  if (!s) return null;
  try {
    const user = await db.user.findUnique({ where: { id: s.userId } });
    if (!user || !user.isActive) return null;
    const tv = (await getSessionTokenVersion()) ?? 0;
    if (tv !== user.tokenVersion) return null;
    if (allowed && !allowed.includes(user.role)) return null;
    const { passwordHash: _ph, ...safe } = user;
    return safe;
  } catch (error) {
    console.error("[auth] Database unavailable while verifying session:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function getSessionTokenVersion(): Promise<number | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return typeof payload.tv === "number" ? payload.tv : 0;
  } catch {
    return null;
  }
}

/**
 * Versi untuk route handler API: membedakan 401 (belum login / sesi mati)
 * dan 403 (login tapi role tidak berhak).
 */
export async function requireApi(
  allowed?: Role[]
): Promise<{ user: SessionUser; response?: undefined } | { user?: undefined; response: NextResponse }> {
  const s = await getSession();
  if (!s) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const user = await requireUser();
  if (!user) return { response: NextResponse.json({ error: "Sesi tidak berlaku" }, { status: 401 }) };
  if (allowed && !allowed.includes(user.role)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/** Pengguna aktif saat ini untuk server component (null bila tidak login). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return requireUser();
}

export function requireRole(session: { role: string } | null, allowed: string[]) {
  return !!session && allowed.includes(session.role);
}

/** Kode unik untuk profil guru/siswa (deterministik-ish, tabrakan sangat kecil). */
export async function generateUniqueCode(prefix: "GR" | "SW"): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const exists =
      prefix === "GR"
        ? await db.teacherProfile.findUnique({ where: { teacherCode: code } })
        : await db.studentProfile.findUnique({ where: { studentCode: code } });
    if (!exists) return code;
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/** Buat profil sesuai role (idempoten — dipakai registrasi & admin create user). */
export async function ensureProfileForUser(user: { id: string; role: Role }) {
  if (user.role === "TEACHER") {
    const exists = await db.teacherProfile.findUnique({ where: { userId: user.id } });
    if (!exists) {
      await db.teacherProfile.create({
        data: { userId: user.id, teacherCode: await generateUniqueCode("GR") },
      });
    }
  } else if (user.role === "STUDENT") {
    const exists = await db.studentProfile.findUnique({ where: { userId: user.id } });
    if (!exists) {
      await db.studentProfile.create({
        data: { userId: user.id, studentCode: await generateUniqueCode("SW") },
      });
    }
  }
}
