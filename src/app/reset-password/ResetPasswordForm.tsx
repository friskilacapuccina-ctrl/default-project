"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error ?? "Kata sandi gagal diperbarui.");
      else setMessage(data.message);
    } catch {
      setError("Tidak dapat terhubung ke layanan. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-aurora-50 via-white to-aurora-100/60 px-4 py-12 dark:from-[#0b1b12] dark:via-[#11251a] dark:to-[#172b1e]">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <section className="card relative z-10 w-full max-w-md p-7 md:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-800 text-white shadow-lg dark:bg-[#315d3d]">
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="text-center text-2xl font-extrabold text-slate-900">Buat kata sandi baru</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Gunakan kata sandi minimal 8 karakter.</p>

        {error && <p role="alert" className="alert alert-danger mt-6">{error}</p>}
        {message ? (
          <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-900">
            <p>{message}</p>
            <Link href="/login" className="mt-3 inline-flex items-center gap-2 font-semibold text-sage-800 hover:underline">Masuk sekarang <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
          </div>
        ) : !token ? (
          <p role="alert" className="alert alert-danger mt-6">Tautan pemulihan tidak lengkap. Minta tautan baru dari halaman lupa kata sandi.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="new-password" className="label">Kata sandi baru</label>
              <input id="new-password" type="password" className="input" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="label">Ulangi kata sandi baru</label>
              <input id="confirm-password" type="password" className="input" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</> : "Simpan kata sandi baru"}
            </button>
          </form>
        )}

        {!message && <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-sage-700 hover:underline"><ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk</Link>}
      </section>
    </main>
  );
}
