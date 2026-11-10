import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit, resetRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });

  // Batasi percobaan login (5 per menit per IP+username) untuk mencegah brute force.
  const username = parsed.data.username.trim().toLowerCase();
  const rlKey = `login:${clientIp(req)}:${username}`;
  if (!rateLimit(rlKey, 5, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan login. Coba lagi dalam satu menit." }, { status: 429 });
  }

  let user;
  try {
    user = await db.user.findFirst({ where: { username: { equals: username, mode: "insensitive" } } });
  } catch (error) {
    console.error("[auth/login] Database unavailable:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Layanan database sedang tidak tersedia. Coba lagi beberapa saat lagi." },
      { status: 503 }
    );
  }
  if (!user) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  if (!user.isActive) return NextResponse.json({ error: "Akun dinonaktifkan. Hubungi admin." }, { status: 403 });

  resetRateLimit(rlKey);
  await createSession(user.id, user.role, user.tokenVersion);
  const redirect = user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher" : "/dashboard";
  return NextResponse.json({ ok: true, redirect });
}
