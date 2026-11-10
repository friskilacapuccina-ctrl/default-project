import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { chatSchema } from "@/lib/validations";
import { askAI } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const auth = await requireApi();
  if (auth.response) return auth.response;
  const user = auth.user;

  // Batas pemakaian AI Tutor: 15 pesan per 5 menit per pengguna.
  if (!rateLimit(`ai:${user.id}`, 15, 5 * 60_000)) {
    return NextResponse.json({ error: "Batas penggunaan AI Tutor tercapai. Coba lagi beberapa menit lagi." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });

  let convId = parsed.data.conversationId;
  let context: string | undefined;
  if (parsed.data.materialId) {
    const m = await db.material.findFirst({
      where: { id: parsed.data.materialId, ...(user.role === "TEACHER" || user.role === "ADMIN" ? {} : { published: true }) },
    });
    if (m) context = `Judul: ${m.title}\nDeskripsi: ${m.description}\nTujuan: ${m.learningObjectives}\nIsi: ${m.content.slice(0, 3000)}`;
  }

  if (convId) {
    // Kepemilikan percakapan: pengguna hanya boleh menyambung percakapannya sendiri.
    const conv = await db.aIConversation.findUnique({ where: { id: convId } });
    if (!conv || conv.userId !== user.id) {
      return NextResponse.json({ error: "Percakapan tidak ditemukan" }, { status: 404 });
    }
  } else {
    const conv = await db.aIConversation.create({
      data: { userId: user.id, materialId: parsed.data.materialId ?? null, title: parsed.data.message.slice(0, 60) },
    });
    convId = conv.id;
  }

  await db.aIMessage.create({ data: { conversationId: convId, role: "USER", content: parsed.data.message } });
  const history = await db.aIMessage.findMany({ where: { conversationId: convId }, orderBy: { createdAt: "desc" }, take: 8 });
  const reply = await askAI({ userMessage: parsed.data.message, context, language: parsed.data.language, history: history.reverse().map((h) => ({ role: h.role, content: h.content })) });
  await db.aIMessage.create({ data: { conversationId: convId, role: "ASSISTANT", content: reply } });

  return NextResponse.json({ reply, conversationId: convId });
}
