"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Aksi admin per baris pengguna: ubah role dan aktifkan/nonaktifkan akun.
 * Perubahan sensitif memicu konfirmasi; server menaikkan tokenVersion sehingga
 * seluruh sesi lama pengguna target langsung mati.
 */
export function UserActions({
  userId,
  username,
  role,
  isActive,
  isSelf,
}: {
  userId: string;
  username: string;
  role: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function patch(body: Record<string, unknown>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Gagal memperbarui pengguna");
        return;
      }
      router.refresh();
    } catch {
      setErr("Koneksi gagal. Perubahan belum disimpan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {err && <span className="text-xs text-red-600 whitespace-nowrap">{err}</span>}
      {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      <select
        className="input w-auto text-xs py-1"
        value={role}
        disabled={busy || isSelf}
        title={isSelf ? "Tidak dapat mengubah role sendiri" : `Ubah role ${username}`}
        onChange={(e) => {
          const newRole = e.target.value;
          if (newRole !== role) patch({ role: newRole }, `Ubah role ${username} menjadi ${newRole}? Sesi aktif pengguna akan dicabut.`);
        }}
      >
        <option value="STUDENT">Siswa</option>
        <option value="TEACHER">Guru</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        className={`btn-sm whitespace-nowrap ${isActive ? "btn-outline text-red-600 border-red-200 hover:bg-red-50" : "btn-outline text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
        disabled={busy || isSelf}
        title={isSelf ? "Tidak dapat menonaktifkan akun sendiri" : undefined}
        onClick={() =>
          patch(
            { isActive: !isActive },
            isActive
              ? `Nonaktifkan akun ${username}? Pengguna tidak bisa login dan sesinya dicabut.`
              : `Aktifkan kembali akun ${username}?`
          )
        }
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
    </div>
  );
}
