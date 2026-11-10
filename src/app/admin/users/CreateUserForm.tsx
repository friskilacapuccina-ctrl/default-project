"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateUserForm() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", role: "TEACHER" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  function generatePassword() {
    const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    const values = new Uint32Array(16);
    crypto.getRandomValues(values);
    const generated = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
    setForm((current) => ({ ...current, password: generated }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); setError(""); setPending(true);
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error ?? "Akun belum berhasil dibuat."); return; }
      setMsg("Akun berhasil dibuat."); setForm({ name: "", username: "", email: "", password: "", role: "TEACHER" });
      router.refresh();
    } catch {
      setError("Koneksi gagal. Periksa jaringan lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label className="space-y-1 text-sm font-medium text-slate-700">Nama<input autoComplete="name" className="input" placeholder="Nama lengkap" value={form.name} onChange={set("name")} required minLength={2} /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700">Username<input autoComplete="username" className="input" placeholder="Username" value={form.username} onChange={set("username")} required minLength={3} /></label>
      <label className="space-y-1 text-sm font-medium text-slate-700">Email<input autoComplete="email" className="input" placeholder="nama@email.com" type="email" value={form.email} onChange={set("email")} required /></label>
      <div className="space-y-1 text-sm font-medium text-slate-700">
        <label className="block" htmlFor="new-user-password">Password awal</label>
        <input id="new-user-password" autoComplete="new-password" className="input" placeholder="Minimal 8 karakter" type="text" value={form.password} onChange={set("password")} required minLength={8} />
        <button type="button" className="btn-ghost btn-sm mt-1" onClick={generatePassword}>Buat password acak</button>
        <p className="text-xs font-normal text-slate-500">Password acak berbeda untuk setiap akun. Salin dan berikan secara pribadi kepada siswa.</p>
      </div>
      <label className="space-y-1 text-sm font-medium text-slate-700">Peran<select className="input" value={form.role} onChange={set("role")}><option value="TEACHER">Guru</option><option value="ADMIN">Admin</option><option value="STUDENT">Siswa</option></select></label>
      <div className="flex items-end"><button className="btn-primary w-full text-sm" disabled={pending}>{pending ? "Menyimpan..." : "Buat Akun"}</button></div>
      {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2 xl:col-span-3">{error}</p>}
      {msg && <p role="status" className="text-sm text-emerald-700 sm:col-span-2 xl:col-span-3">{msg}</p>}
    </form>
  );
}
