"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

export function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    if (form.newPassword !== form.confirmPassword) {
      setErr("Konfirmasi password tidak sama");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setMsg("Password berhasil diganti.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setErr(data.error ?? "Gagal mengganti password");
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="label">Password Saat Ini</label>
        <input type="password" className="input" value={form.currentPassword} onChange={set("currentPassword")} required />
      </div>
      <div>
        <label className="label">Password Baru</label>
        <input type="password" className="input" value={form.newPassword} onChange={set("newPassword")} minLength={8} required />
      </div>
      <div>
        <label className="label">Konfirmasi Password Baru</label>
        <input type="password" className="input" value={form.confirmPassword} onChange={set("confirmPassword")} minLength={8} required />
      </div>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary" disabled={busy}>
        <KeyRound className="w-4 h-4" /> {busy ? "Menyimpan..." : "Ganti Password"}
      </button>
    </form>
  );
}
