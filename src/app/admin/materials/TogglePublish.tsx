"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TogglePublish({ id, published }: { id: string; published: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function toggle() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/materials", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, published: !published }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Status materi belum berhasil diubah."); return; }
      router.refresh();
    } catch { setError("Koneksi gagal. Coba lagi."); }
    finally { setLoading(false); }
  }
  return <span className="inline-flex flex-col items-end">{error && <span role="alert" className="mb-1 text-xs text-red-600">{error}</span>}<button onClick={toggle} disabled={loading} className="btn-secondary text-sm">{loading ? "Menyimpan..." : published ? "Sembunyikan" : "Terbitkan"}</button></span>;
}
