import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TeacherStudentsTable, type TeacherStudentRow } from "./StudentsTable";
import { Users } from "lucide-react";

export default async function TeacherStudents() {
  const user = await getCurrentUser();
  if (!user) return null;

  const courseIds = user.role === "ADMIN"
    ? (await db.course.findMany({ select: { id: true } })).map((course) => course.id)
    : (await db.courseTeacher.findMany({ where: { teacherId: user.id }, select: { courseId: true } })).map((course) => course.courseId);

  const enrollments = await db.courseStudent.findMany({
    where: { courseId: { in: courseIds } },
    include: { student: { select: { id: true, name: true, username: true, email: true } }, course: { select: { id: true, name: true } } },
  });
  const studentIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.studentId)));
  const [materials, pretests, posttests, progress] = await Promise.all([
    db.material.count({ where: { published: true } }),
    db.pretestAttempt.findMany({ where: { userId: { in: studentIds } }, orderBy: { completedAt: "desc" }, select: { userId: true, score: true } }),
    db.posttestAttempt.findMany({ where: { userId: { in: studentIds } }, orderBy: { completedAt: "desc" }, select: { userId: true, score: true } }),
    db.progress.findMany({ where: { userId: { in: studentIds }, completed: true, material: { published: true } }, select: { userId: true, materialId: true } }),
  ]);

  const students = new Map<string, TeacherStudentRow>();
  for (const enrollment of enrollments) {
    const row = students.get(enrollment.studentId) ?? {
      studentId: enrollment.studentId,
      name: enrollment.student.name,
      username: enrollment.student.username,
      email: enrollment.student.email,
      courses: [],
      pre: null,
      post: null,
      progress: 0,
      materialCount: materials,
    };
    if (!row.courses.includes(enrollment.course.name)) row.courses.push(enrollment.course.name);
    students.set(enrollment.studentId, row);
  }
  const latest = (rows: Array<{ userId: string; score: number }>) => {
    const map = new Map<string, number>();
    for (const row of rows) if (!map.has(row.userId)) map.set(row.userId, row.score);
    return map;
  };
  const latestPre = latest(pretests);
  const latestPost = latest(posttests);
  const completedMaterials = new Map<string, Set<string>>();
  for (const item of progress) {
    const set = completedMaterials.get(item.userId) ?? new Set<string>();
    set.add(item.materialId);
    completedMaterials.set(item.userId, set);
  }
  const rows = Array.from(students.values()).map((student) => {
    student.pre = latestPre.get(student.studentId) ?? null;
    student.post = latestPost.get(student.studentId) ?? null;
    student.progress = completedMaterials.get(student.studentId)?.size ?? 0;
    return student;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppShell allow={["TEACHER", "ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900"><Users className="h-8 w-8 text-sage-600" />Data Siswa</h1>
          <p className="mt-1 text-slate-600">Pantau progres, nilai terbaru, dan kelas siswa yang Anda ampu.</p>
        </div>
        <TeacherStudentsTable rows={rows} />
      </div>
    </AppShell>
  );
}
