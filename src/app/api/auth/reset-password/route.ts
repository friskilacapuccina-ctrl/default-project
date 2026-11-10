import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`reset-password:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi beberapa saat." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue?.message ?? "Data pemulihan tidak valid." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const now = new Date();
  const passwordHash = await hashPassword(parsed.data.password);

  const changed = await db.$transaction(async (tx) => {
    const [token] = await tx.$queryRaw<Array<{ id: string; userId: string; expiresAt: Date }>>`
      SELECT "id", "userId", "expiresAt"
      FROM "PasswordResetToken"
      WHERE "tokenHash" = ${tokenHash}
      FOR UPDATE
    `;
    if (!token || token.expiresAt <= now) {
      if (token) await tx.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "id" = ${token.id}`;
      return false;
    }

    const consumed = await tx.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "id" = ${token.id} AND "expiresAt" > ${now}`;
    if (consumed !== 1) return false;

    await tx.user.update({ where: { id: token.userId }, data: { passwordHash, tokenVersion: { increment: 1 } } });
    await tx.$executeRaw`DELETE FROM "PasswordResetToken" WHERE "userId" = ${token.userId}`;
    return true;
  });

  if (!changed) {
    return NextResponse.json({ error: "Tautan pemulihan tidak valid atau sudah kedaluwarsa. Minta tautan baru." }, { status: 400 });
  }

  return NextResponse.json({ message: "Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru." });
}
