"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserRoundCog } from "lucide-react";

type StudentOption = { id: string; username: string; name: string };
type TeacherOption = { id: string; username: string };

export function EnrollForm({
  courseId,
  students,
  enrolledStudentIds,
  teachers,
  isAdmin,
}: {
  courseId: string;
  students: StudentOption[];
  enrolledStudentIds: string[];
  teachers: TeacherOption[];
  isAdmin: boolean;
}) {
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function post(url: string, body: object, kind: "student" | "teacher") {
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Perubahan belum berhasil disimpan.");
        return;
      }
      setMessage(kind === "student" ? "Siswa berhasil ditambahkan ke kelas." : "Guru berhasil ditugaskan.");
      if (kind === "student") setStudentId("");
      else setTeacherId("");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }

  const availableStudents = students.filter((student) => !enrolledStudentIds.includes(student.id));
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block min-w-0 space-y-1.5 text-sm font-medium text-slate-700">
          Siswa yang akan ditambahkan
          <select className="input" value={studentId} onChange={(event) => setStudentId(event.target.value)} disabled={!availableStudents.length || pending} aria-label="Pilih siswa untuk ditambahkan">
            <option value="">{availableStudents.length ? "Pilih nama siswa" : "Semua siswa sudah terdaftar"}</option>
            {availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · @{student.username}</option>)}
          </select>
        </label>
        <button type="button" className="btn-primary inline-flex items-center justify-center gap-2" disabled={!studentId || pending} onClick={() => post("/api/enrollment/student", { courseId, studentId }, "student")}>
          <UserPlus className="h-4 w-4" />{pending ? "Menyimpan..." : "Tambah siswa"}
        </button>
      </div>

      {isAdmin && <div className="grid gap-3 border-t border-slate-100 pt-3 dark:border-[#304636] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block min-w-0 space-y-1.5 text-sm font-medium text-slate-700">
          Guru yang akan ditugaskan
          <select className="input" value={teacherId} onChange={(event) => setTeacherId(event.target.value)} disabled={pending} aria-label="Pilih guru untuk ditugaskan">
            <option value="">Pilih guru</option>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>@{teacher.username}</option>)}
          </select>
        </label>
        <button type="button" className="btn-secondary inline-flex items-center justify-center gap-2" disabled={!teacherId || pending} onClick={() => post("/api/enrollment/teacher", { courseId, teacherId }, "teacher")}>
          <UserRoundCog className="h-4 w-4" />Tugaskan guru
        </button>
      </div>}

      {message && <p className="text-sm text-emerald-700 dark:text-[#b8d596]" role="status">{message}</p>}
      {error && <p className="text-sm text-red-600 dark:text-[#f0b8ad]" role="alert">{error}</p>}
    </div>
  );
}
