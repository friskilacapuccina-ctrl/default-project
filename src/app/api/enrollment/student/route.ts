import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApi } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({ courseId: z.string().min(1), studentId: z.string().min(1) });

/**
 * POST /api/enrollment/student — admin menambahkan siswa ke kelas mana pun;
 * guru HANYA ke kelas yang menjadi penugasannya (dicek via CourseTeacher).
 */
export async function POST(req: Request) {
  const auth = await requireApi(["ADMIN", "TEACHER"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const { courseId, studentId } = parsed.data;

  if (auth.user.role === "TEACHER") {
    const assigned = await db.courseTeacher.findUnique({
      where: { courseId_teacherId: { courseId, teacherId: auth.user.id } },
    });
    if (!assigned) {
      return NextResponse.json({ error: "Anda tidak ditugaskan untuk kelas ini" }, { status: 403 });
    }
  }

  const [course, student] = await Promise.all([
    db.course.findUnique({ where: { id: courseId } }),
    db.user.findUnique({ where: { id: studentId } }),
  ]);
  if (!course) return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Target bukan akun siswa" }, { status: 400 });
  }

  await db.courseStudent.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    update: {},
    create: { courseId, studentId },
  });
  await writeAuditLog({
    actorId: auth.user.id,
    action: "STUDENT_ENROLL",
    targetType: "COURSE",
    targetId: courseId,
    detail: { studentUsername: student.username },
  });
  return NextResponse.json({ ok: true });
}

/** Admin mengeluarkan siswa dari satu course tanpa menghapus akun/progres belajar. */
export async function DELETE(req: Request) {
  const auth = await requireApi(["ADMIN"]);
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const enrollment = await db.courseStudent.findUnique({
    where: { courseId_studentId: parsed.data },
    include: { course: { select: { name: true } }, student: { select: { username: true } } },
  });
  if (!enrollment) return NextResponse.json({ error: "Enrollment siswa tidak ditemukan." }, { status: 404 });
  await db.courseStudent.delete({ where: { id: enrollment.id } });
  await writeAuditLog({ actorId: auth.user.id, action: "STUDENT_UNENROLL", targetType: "COURSE", targetId: parsed.data.courseId, detail: { course: enrollment.course.name, studentUsername: enrollment.student.username } });
  return NextResponse.json({ ok: true });
}
