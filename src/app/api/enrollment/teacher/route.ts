import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({ courseId: z.string().min(1), teacherId: z.string().min(1) });

/**
 * POST /api/enrollment/teacher — admin menetapkan guru ke kelas.
 * Guru yang ditetapkan wajib berrole TEACHER; dicatat ke audit log.
 */
export async function POST(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const { courseId, teacherId } = parsed.data;

  const [course, teacher] = await Promise.all([
    db.course.findUnique({ where: { id: courseId } }),
    db.user.findUnique({ where: { id: teacherId } }),
  ]);
  if (!course) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
  if (!teacher || teacher.role !== "TEACHER") {
    return NextResponse.json({ error: "Target bukan akun guru" }, { status: 400 });
  }

  await db.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId, teacherId } },
    update: {},
    create: { courseId, teacherId },
  });
  await writeAuditLog({
    actorId: auth.user.id,
    action: "TEACHER_ASSIGN",
    targetType: "COURSE",
    targetId: courseId,
    detail: { teacherUsername: teacher.username },
  });
  return NextResponse.json({ ok: true });
}

/** Admin mencabut penugasan guru dari satu course. */
export async function DELETE(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const assignment = await db.courseTeacher.findUnique({
    where: { courseId_teacherId: parsed.data },
    include: { course: { select: { name: true } }, teacher: { select: { username: true } } },
  });
  if (!assignment) return NextResponse.json({ error: "Penugasan guru tidak ditemukan." }, { status: 404 });
  await db.courseTeacher.delete({ where: { id: assignment.id } });
  await writeAuditLog({ actorId: auth.user.id, action: "TEACHER_UNASSIGN", targetType: "COURSE", targetId: parsed.data.courseId, detail: { course: assignment.course.name, teacherUsername: assignment.teacher.username } });
  return NextResponse.json({ ok: true });
}
