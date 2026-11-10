import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FileCheck2, ArrowUpDown } from "lucide-react";
import { ExportResults } from "./ExportResults";

/** Hanya siswa pada kelas yang menjadi penugasan guru (admin melihat semua). */
async function scopedStudentIds(userId: string, isAdmin: boolean): Promise<string[]> {
  if (isAdmin) {
    const all = await db.user.findMany({ where: { role: "STUDENT" }, select: { id: true } });
    return all.map((s) => s.id);
  }
  const courses = await db.courseTeacher.findMany({ where: { teacherId: userId } });
  const enroll = await db.courseStudent.findMany({ where: { courseId: { in: courses.map((c) => c.courseId) } } });
  return Array.from(new Set(enroll.map((e) => e.studentId)));
}

export default async function TeacherResults() {
  const user = await getCurrentUser();
  if (!user) return null;
  const ids = await scopedStudentIds(user.id, user.role === "ADMIN");
  const [pres, posts] = await Promise.all([
    db.pretestAttempt.findMany({ where: { userId: { in: ids } }, orderBy: { completedAt: "desc" }, include: { user: true } }),
    db.posttestAttempt.findMany({ where: { userId: { in: ids } }, orderBy: { completedAt: "desc" }, include: { user: true } }),
  ]);

  const latestByStudent = <T extends { userId: string }>(rows: T[]) => {
    const latest = new Map<string, T>();
    for (const row of rows) if (!latest.has(row.userId)) latest.set(row.userId, row);
    return latest;
  };
  const latestPre = latestByStudent(pres);
  const latestPost = latestByStudent(posts);
  const pairedChanges = Array.from(latestPre.entries()).filter(([id]) => latestPost.has(id)).map(([id, pre]) => latestPost.get(id)!.score - pre.score);
  const pairedChange = pairedChanges.length ? Math.round(pairedChanges.reduce((sum, value) => sum + value, 0) / pairedChanges.length) : 0;
  const avg = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  const preStats = {
    total: pres.length,
    avgScore: avg(Array.from(latestPre.values(), (row) => row.score)),
  };
  const postStats = {
    total: posts.length,
    avgScore: avg(Array.from(latestPost.values(), (row) => row.score)),
  };



  return (
    <AppShell allow={["TEACHER", "ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-5.618 3.984M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Hasil Belajar
            </h1>
            <p className="text-slate-600 mt-1">Lihat detail attempt pretest dan posttest siswa</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportResults pretests={pres.map((r) => ({ username: r.user.username, score: r.score, correctCount: r.correctCount, wrongCount: r.wrongCount, completedAt: r.completedAt.toISOString() }))} posttests={posts.map((r) => ({ username: r.user.username, score: r.score, correctCount: r.correctCount, wrongCount: r.wrongCount, completedAt: r.completedAt.toISOString() }))} />
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <TestSummary title="Pretest" attempts={preStats.total} average={preStats.avgScore} students={latestPre.size} />
          <TestSummary title="Posttest" attempts={postStats.total} average={postStats.avgScore} students={latestPost.size} />
        </div>
        <p className="mb-6 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-900">{pairedChanges.length ? `Perubahan rata-rata: ${pairedChange > 0 ? "+" : ""}${pairedChange} poin pada ${pairedChanges.length} siswa yang memiliki kedua hasil tes.` : "Perubahan nilai akan tampil setelah ada siswa yang menyelesaikan kedua tes."}</p>

        <div className="space-y-6">
          <div className="card-hover mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-sage-600" />
                Pretest Attempts
              </h2>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">{pres.length} Attempts</span>
              </div>
            </div>
            {pres.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Belum ada attempt.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="w-4 h-4 text-slate-400" />
                          Siswa
                        </div>
                      </th>
                      <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Skor</th>
                      <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Benar</th>
                      <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Salah</th>
                      <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Persentase</th>
                      <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pres.map((r) => (
                      <tr key={r.id} className="hover:bg-sage-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                              <span className="font-semibold text-sage-700">{r.user.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{r.user.username}</p>
                            </div>
                          </div>
                        </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-slate-900">{r.score}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-medium text-green-600">{r.correctCount}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-medium text-red-600">{r.wrongCount}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-sage-700">{r.score}%</span>
                          </td>
                          <td className="p-4 text-center text-slate-500">
                            {new Date(r.completedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="card-hover mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-sage-600" />
                  Posttest Attempts
                </h2>
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">{posts.length} Attempts</span>
                </div>
              </div>
              {posts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Belum ada attempt.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 16v12m0 0l4-4m-4 4l-4-4" /></svg>
                            Siswa
                          </div>
                        </th>
                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Skor</th>
                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Benar</th>
                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Salah</th>
                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Persentase</th>
                        <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posts.map((r) => (
                        <tr key={r.id} className="hover:bg-sage-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                                <span className="font-semibold text-sage-700">{r.user.username.charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{r.user.username}</p>
                              </div>
                            </div>
                          </td>
                            <td className="p-4 text-center">
                              <span className="font-bold text-slate-900">{r.score}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium text-green-600">{r.correctCount}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-medium text-red-600">{r.wrongCount}</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-semibold text-sage-700">{r.score}%</span>
                            </td>
                            <td className="p-4 text-center text-slate-500">
                              {new Date(r.completedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
        </div>
      </div>
    </AppShell>
  );
}

function TestSummary({ title, attempts, average, students }: { title: string; attempts: number; average: number; students: number }) {
  return <section className="card !p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{attempts} percobaan · {students} siswa</p></div><FileCheck2 className="h-5 w-5 text-sage-600" /></div><p className="mt-4 text-3xl font-semibold tabular-nums text-slate-900">{students ? average : "—"}<span className="ml-1 text-sm font-normal text-slate-500">{students ? "rata-rata terbaru /100" : "belum ada nilai"}</span></p></section>;
}
