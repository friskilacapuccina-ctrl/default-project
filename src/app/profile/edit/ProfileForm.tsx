"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null); setErr(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setMsg("Profil diperbarui.");
      router.refresh();
    } else {
      setErr(data.error ?? "Gagal memperbarui profil");
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="label">Nama Lengkap</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
      </div>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary" disabled={busy}>
        <Save className="w-4 h-4" /> {busy ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
