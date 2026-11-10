import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { EnrollForm } from "./EnrollForm";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";

export default async function EnrollmentPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const isAdmin = user.role === "ADMIN";

  const courses = isAdmin
    ? await db.course.findMany({ include: { teachers: { include: { teacher: true } }, students: { include: { student: true } } }, orderBy: { name: "asc" } })
    : await db.course.findMany({
        where: { teachers: { some: { teacherId: user.id } } },
        include: { teachers: { include: { teacher: true } }, students: { include: { student: true } } },
        orderBy: { name: "asc" },
      });
  const students = await db.user.findMany({ where: { role: "STUDENT" }, orderBy: [{ name: "asc" }, { username: "asc" }] });
  const teachers = isAdmin ? await db.user.findMany({ where: { role: "TEACHER" }, orderBy: { username: "asc" } }) : [];
  const studentCount = new Set(courses.flatMap((course) => course.students.map((row) => row.studentId))).size;
  const teacherCount = new Set(courses.flatMap((course) => course.teachers.map((row) => row.teacherId))).size;

  return (
    <AppShell allow={["TEACHER", "ADMIN"]}>
      <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-500">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-sage-700">Ruang Guru</p>
            <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
              <GraduationCap className="h-8 w-8 text-sage-600" />
              Kelas & Enrollment
            </h1>
            <p className="mt-1 text-slate-600">Lihat daftar kelas, guru pengampu, dan siswa yang terdaftar.</p>
          </div>
          <Link href="/teacher/students" className="btn-secondary inline-flex items-center gap-2 self-start sm:self-auto">
            Lihat data siswa <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section aria-label="Ringkasan enrollment" className="grid gap-3 sm:grid-cols-3">
          <Summary label="Kelas" value={courses.length} detail="Kelas yang dapat Anda akses" icon={<BookOpen className="h-5 w-5" />} />
          <Summary label="Siswa" value={studentCount} detail="Siswa terdaftar di kelas" icon={<Users className="h-5 w-5" />} />
          <Summary label="Guru pengampu" value={teacherCount} detail="Guru yang ditugaskan" icon={<GraduationCap className="h-5 w-5" />} />
        </section>

        {courses.length === 0 ? (
          <section className="card py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700"><BookOpen className="h-6 w-6" /></span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Belum ada kelas yang ditugaskan</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">Hubungi admin untuk meminta penugasan kelas. Setelah ditugaskan, daftar kelas dan siswanya akan muncul di sini.</p>
          </section>
        ) : (
          <div className="space-y-5">
            {courses.map((course) => {
              const enrolledStudents = [...course.students].sort((a, b) => a.student.name.localeCompare(b.student.name));
              const assignedTeachers = [...course.teachers].sort((a, b) => a.teacher.name.localeCompare(b.teacher.name));
              const previewStudents = enrolledStudents.slice(0, 6);

              return (
                <article key={course.id} className="overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-sm dark:border-[#304636] dark:bg-[#192b20]">
                  <div className="flex flex-col gap-4 border-b border-sage-100 bg-sage-50/70 p-5 dark:border-[#304636] dark:bg-[#203328] sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-200 text-sage-800 dark:bg-[#34553a] dark:text-[#dce9c9]"><GraduationCap className="h-5 w-5" /></span>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-slate-900">{course.name}</h2>
                        <p className="mt-1 text-sm text-slate-600">{course.description || "Kelas pembelajaran Biologi"}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-sage-800 ring-1 ring-sage-200 dark:bg-[#293e2e] dark:text-[#dce9c9] dark:ring-[#466047]">{enrolledStudents.length} siswa</span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-[#293e2e] dark:text-[#dce9c9] dark:ring-[#466047]">{assignedTeachers.length} guru</span>
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.65fr)]">
                    <section aria-label={`Daftar siswa ${course.name}`}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div><h3 className="font-semibold text-slate-900">Siswa di kelas</h3><p className="text-sm text-slate-500">Daftar nama yang sudah terdaftar</p></div>
                        <span className="text-sm font-medium text-slate-500">{enrolledStudents.length} orang</span>
                      </div>
                      {enrolledStudents.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-sage-300 bg-sage-50/60 px-4 py-6 text-center text-sm text-slate-600 dark:border-[#466047] dark:bg-[#203328]">Belum ada siswa di kelas ini.</p>
                      ) : (
                        <>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {previewStudents.map(({ student }) => <StudentRow key={student.id} name={student.name} username={student.username} />)}
                          </ul>
                          {enrolledStudents.length > previewStudents.length && (
                            <details className="group mt-3 rounded-xl border border-slate-200 dark:border-[#304636]">
                              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-sage-800 marker:hidden dark:text-[#cfe2b7]">Lihat semua {enrolledStudents.length} siswa <span className="font-normal text-slate-500">(termasuk {enrolledStudents.length - previewStudents.length} lainnya)</span></summary>
                              <ul className="grid gap-2 border-t border-slate-100 p-3 dark:border-[#304636] sm:grid-cols-2">
                                {enrolledStudents.slice(previewStudents.length).map(({ student }) => <StudentRow key={student.id} name={student.name} username={student.username} />)}
                              </ul>
                            </details>
                          )}
                        </>
                      )}
                    </section>

                    <div className="space-y-5">
                      <section aria-label={`Guru pengampu ${course.name}`}>
                        <h3 className="mb-3 font-semibold text-slate-900">Guru pengampu</h3>
                        {assignedTeachers.length ? <ul className="space-y-2">{assignedTeachers.map(({ teacher }) => <li key={teacher.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-[#203328]"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-200 text-sm font-bold text-sage-800 dark:bg-[#34553a] dark:text-[#dce9c9]">{teacher.name.slice(0, 1).toLocaleUpperCase("id-ID")}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{teacher.name}</span><span className="block truncate text-xs text-slate-500">@{teacher.username}</span></span></li>)}</ul> : <p className="text-sm text-slate-500">Belum ada guru pengampu.</p>}
                      </section>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-white px-5 py-4 dark:border-[#304636] dark:bg-[#192b20]">
                    <h3 className="mb-3 font-semibold text-slate-900">Tambahkan anggota kelas</h3>
                    <EnrollForm
                      courseId={course.id}
                      students={students.map((student) => ({ id: student.id, username: student.username, name: student.name }))}
                      enrolledStudentIds={course.students.map((item) => item.studentId)}
                      teachers={teachers.map((teacher) => ({ id: teacher.id, username: teacher.username }))}
                      isAdmin={isAdmin}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Summary({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
  return <div className="card !p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-[#294532] dark:text-[#d3e4bf]">{icon}</span></div><p className="mt-2 text-xs text-slate-500">{detail}</p></div>;
}

function StudentRow({ name, username }: { name: string; username: string }) {
  return <li className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-[#304636] dark:bg-[#203328]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-sage-800 dark:bg-[#34553a] dark:text-[#dce9c9]">{name.slice(0, 1).toLocaleUpperCase("id-ID")}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{name}</span><span className="block truncate text-xs text-slate-500">@{username}</span></span></li>;
}
