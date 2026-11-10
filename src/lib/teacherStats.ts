import { db } from "@/lib/db";

async function teacherStudentIds(userId: string, isAdmin: boolean): Promise<string[]> {
  if (isAdmin) {
    const all = await db.user.findMany({ where: { role: "STUDENT" }, select: { id: true } });
    return all.map((student) => student.id);
  }
  const courses = await db.courseTeacher.findMany({ where: { teacherId: userId } });
  const enrollments = await db.courseStudent.findMany({
    where: { courseId: { in: courses.map((course) => course.courseId) } },
  });
  return Array.from(new Set(enrollments.map((enrollment) => enrollment.studentId)));
}

export async function getTeacherStats(userId: string, isAdmin: boolean) {
  const ids = await teacherStudentIds(userId, isAdmin);
  const [students, pretests, posttests, matDone] = await Promise.all([
    db.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, username: true } }),
    db.pretestAttempt.findMany({ where: { userId: { in: ids } }, orderBy: { completedAt: "desc" } }),
    db.posttestAttempt.findMany({ where: { userId: { in: ids } }, orderBy: { completedAt: "desc" } }),
    db.progress.count({ where: { userId: { in: ids }, completed: true, material: { published: true } } }),
  ]);
  const latestScores = (rows: Array<{ userId: string; score: number }>) => {
    const scores = new Map<string, number>();
    for (const row of rows) if (!scores.has(row.userId)) scores.set(row.userId, row.score);
    return scores;
  };
  const average = (scores: number[]) =>
    scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0;
  const latestPre = latestScores(pretests);
  const latestPost = latestScores(posttests);
  const pairedChanges = Array.from(latestPre.entries())
    .filter(([studentId]) => latestPost.has(studentId))
    .map(([studentId, preScore]) => (latestPost.get(studentId) ?? preScore) - preScore);
  const latestPostByStudent = new Map(latestPost);
  const topStudents = students
    .filter((student) => latestPostByStudent.has(student.id))
    .map((student) => ({ ...student, score: latestPostByStudent.get(student.id) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 5);
  return {
    count: students.length,
    avgPre: average(Array.from(latestPre.values())),
    avgPost: average(Array.from(latestPost.values())),
    pairedChange: average(pairedChanges),
    pairedCount: pairedChanges.length,
    preCount: latestPre.size,
    postCount: latestPost.size,
    topStudents,
    matDone,
    finishedPost: new Set(posttests.map((attempt) => attempt.userId)).size,
    ids,
  };
}
