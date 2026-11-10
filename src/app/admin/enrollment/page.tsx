import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { EnrollForm } from "@/app/teacher/enrollment/EnrollForm";
import { CourseActions, CreateCourseForm } from "./CourseManager";
import { UnassignButton } from "./UnassignButton";
import { Users, GraduationCap } from "lucide-react";

export default async function AdminEnrollment() {
  const [courses, students, teachers] = await Promise.all([
    db.course.findMany({ include: { teachers: { include: { teacher: true } }, students: { include: { student: true } } } }),
    db.user.findMany({ where: { role: "STUDENT" }, orderBy: { username: "asc" } }),
    db.user.findMany({ where: { role: "TEACHER" }, orderBy: { username: "asc" } }),
  ]);

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-sage-600" />
              Enrollment Management
            </h1>
            <p className="text-slate-600 mt-1">Kelola course, guru, dan siswa di seluruh sistem</p>
          </div>
        </div>

        <CreateCourseForm />
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="card text-center py-12">
              <GraduationCap className="w-16 h-16 text-sage-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Course</h3>
              <p className="text-slate-500 mb-4">Buat course pertama untuk memulai enrollment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map((c) => (
                <div key={c.id} className="card-hover">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-xl text-slate-900">{c.name}</h2>
                        {c.description && <p className="mt-1 max-w-xl text-sm text-slate-500">{c.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge badge-primary">{c.students.length} Siswa</span>
                      <span className="badge bg-blue-100 text-blue-700">{c.teachers.length} Guru</span>
                    </div>
                  </div>
                  <CourseActions courseId={c.id} name={c.name} description={c.description} />
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Guru Terdaftar</p>
                          <p className="text-sm text-slate-500">{c.teachers.length} guru</p>
                        </div>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {c.teachers.length === 0 ? (
                          <p className="text-sm text-slate-500">Belum ada guru</p>
                        ) : (
                          c.teachers.map((t) => (
                            <div key={t.teacher.id} className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 text-sm">
                              <span className="flex min-w-0 items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                                <span className="font-semibold text-blue-700">{t.teacher.username.charAt(0).toUpperCase()}</span>
                              </span>
                              <span className="truncate font-medium text-slate-900">{t.teacher.username}</span>
                              </span>
                              <UnassignButton courseId={c.id} userId={t.teacher.id} kind="teacher" label={t.teacher.username} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-sage-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Siswa Ter-enroll</p>
                          <p className="text-sm text-slate-500">{c.students.length} siswa</p>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {c.students.length === 0 ? (
                          <p className="text-sm text-slate-500">Belum ada siswa</p>
                        ) : (
                          c.students.map((s) => (
                            <div key={s.student.id} className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 text-sm">
                              <span className="flex min-w-0 items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                                <span className="font-semibold text-sage-700">{s.student.username.charAt(0).toUpperCase()}</span>
                              </span>
                              <span className="truncate font-medium text-slate-900">{s.student.username}</span>
                              </span>
                              <UnassignButton courseId={c.id} userId={s.student.id} kind="student" label={s.student.username} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <EnrollForm 
                      courseId={c.id} 
                      students={students.map((s) => ({ id: s.id, username: s.username, name: s.name }))} 
                      enrolledStudentIds={c.students.map((item) => item.studentId)}
                      teachers={teachers.map((t) => ({ id: t.id, username: t.username }))}
                      isAdmin={true}
                    />
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </AppShell>
  );
}
