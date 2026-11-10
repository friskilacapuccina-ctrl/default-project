"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error ?? "Permintaan pemulihan gagal diproses.");
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
        <h1 className="text-center text-2xl font-extrabold text-slate-900">Lupa kata sandi?</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">Masukkan email yang terhubung ke akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru.</p>

        {error && <p role="alert" className="alert alert-danger mt-6">{error}</p>}
        {message ? (
          <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">{message}</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label htmlFor="recovery-email" className="label">Email akun</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input id="recovery-email" type="email" className="input input-with-icon" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim...</> : "Kirim tautan pemulihan"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-sage-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk
        </Link>
      </section>
    </main>
  );
}
