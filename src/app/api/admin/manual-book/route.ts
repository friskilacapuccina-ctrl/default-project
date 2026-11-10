import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  fileName: z.string().trim().max(200).optional().or(z.literal("")),
  fileUrl: z.string().trim().max(2000).refine((value) => !value || value.startsWith("/") || /^https:\/\//i.test(value), "URL harus HTTPS atau path lokal seperti /manuals/panduan.pdf").optional().or(z.literal("")),
  version: z.string().trim().min(1).max(40),
});

export async function PATCH(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data buku petunjuk." }, { status: 400 });
  const data = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    fileName: parsed.data.fileName || null,
    fileUrl: parsed.data.fileUrl || null,
    fileType: parsed.data.fileUrl ? "application/pdf" : null,
    version: parsed.data.version,
  };
  const existing = await db.manualBook.findFirst({ orderBy: { updatedAt: "desc" } });
  const book = existing
    ? await db.manualBook.update({ where: { id: existing.id }, data })
    : await db.manualBook.create({ data });
  await writeAuditLog({ actorId: auth.user.id, action: "MANUAL_BOOK_UPDATE", targetType: "MANUAL_BOOK", targetId: book.id, detail: { title: book.title, fileName: book.fileName, version: book.version } });
  return NextResponse.json({ ok: true, book });
}
