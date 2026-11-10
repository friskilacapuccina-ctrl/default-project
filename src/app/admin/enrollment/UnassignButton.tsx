"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";

export function UnassignButton({ courseId, userId, kind, label }: { courseId: string; userId: string; kind: "student" | "teacher"; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (!window.confirm(`Keluarkan ${label} dari kelas ini? Akun dan progres belajarnya tidak akan dihapus.`)) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/enrollment/${kind}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(kind === "student" ? { courseId, studentId: userId } : { courseId, teacherId: userId }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Tidak dapat mengubah enrollment."); return; }
      router.refresh();
    } catch { setError("Koneksi gagal. Silakan coba lagi."); }
    finally { setPending(false); }
  }
  return <span className="inline-flex items-center gap-1">
    {error && <span role="alert" className="max-w-36 text-xs text-red-600">{error}</span>}
    <button type="button" className="btn-ghost btn-sm text-slate-500 hover:text-red-700" disabled={pending} onClick={remove} title={`Keluarkan ${label} dari kelas`} aria-label={`Keluarkan ${label} dari kelas`}><UserMinus className="h-4 w-4" /></button>
  </span>;
}
