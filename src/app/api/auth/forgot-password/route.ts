import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { forgotPasswordSchema } from "@/lib/validations";

const GENERIC_MESSAGE = "Jika email tersebut terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan folder spam.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Masukkan alamat email yang valid." }, { status: 400 });
  }

  const email = parsed.data.email;
  const ip = clientIp(req);
  if (!rateLimit(`forgot-password:ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`forgot-password:email:${email}`, 3, 15 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi beberapa saat." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const appUrl = process.env.APP_URL;
  if (!apiKey || !from || !appUrl) {
    return NextResponse.json(
      { error: "Layanan pemulihan belum dikonfigurasi. Silakan hubungi administrator." },
      { status: 503 },
    );
  }

  const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, isActive: true } });
  if (!user || !user.isActive) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60_000);

  let resetUrl: URL;
  try {
    resetUrl = new URL("/reset-password", appUrl);
  } catch {
    return NextResponse.json({ error: "Konfigurasi alamat aplikasi tidak valid. Hubungi administrator." }, { status: 503 });
  }
  resetUrl.searchParams.set("token", token);
  const tokenId = randomUUID();
  await db.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "userId" = ${user.id}`;
  await db.$executeRaw`INSERT INTO "PasswordResetToken" ("id", "userId", "tokenHash", "expiresAt") VALUES (${tokenId}, ${user.id}, ${tokenHash}, ${expiresAt})`;

  let emailResponse: Response;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: "Atur ulang kata sandi BioLearn AI",
        text: `Kami menerima permintaan untuk mengatur ulang kata sandi akun BioLearn AI Anda. Buka tautan ini dalam 30 menit: ${resetUrl.toString()} Jika Anda tidak meminta perubahan ini, abaikan email ini.`,
        html: `<p>Kami menerima permintaan untuk mengatur ulang kata sandi akun BioLearn AI Anda.</p><p><a href="${resetUrl.toString()}">Atur ulang kata sandi</a></p><p>Tautan berlaku selama 30 menit dan hanya dapat digunakan sekali. Jika Anda tidak meminta perubahan ini, abaikan email ini.</p>`,
      }),
      cache: "no-store",
    });
  } catch {
    await db.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "id" = ${tokenId}`;
    return NextResponse.json({ error: "Email pemulihan gagal dikirim. Coba lagi nanti atau hubungi administrator." }, { status: 503 });
  }

  if (!emailResponse.ok) {
    await db.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "id" = ${tokenId}`;
    return NextResponse.json({ error: "Email pemulihan gagal dikirim. Coba lagi nanti atau hubungi administrator." }, { status: 503 });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
