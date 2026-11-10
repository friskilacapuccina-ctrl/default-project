"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dna, Eye, EyeOff, Loader2, Lock, Leaf } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { translate, useLanguage } from "@/components/layout/LanguageProvider";

export default function LoginPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); 
    setLoading(true);
    const res = await fetch("/api/auth/login", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(form) 
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setErr(data.error ?? "Login gagal"); return; }
    router.push(data.redirect);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-aurora-50 via-white to-aurora-100/60 px-4 py-12 dark:from-[#0b1b12] dark:via-[#11251a] dark:to-[#172b1e]">
      <div className="absolute right-4 top-4 z-20"><ThemeToggle /></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-aurora-200/40 to-aurora-300/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-in fade-in">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-800 to-aurora-900 shadow-xl shadow-aurora-900/20 dark:from-[#315d3d] dark:to-[#23472f]">
              <Leaf className="h-8 w-8 text-white" strokeWidth={2.2} />
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{translate("Selamat Datang Kembali", language)}</h1>
          <p className="text-slate-600">{translate("Masuk ke akun BioLearn AI untuk melanjutkan belajar", language)}</p>
        </div>

        {/* Login Card */}
        <div className="card animate-in slide-in-from-bottom-4 duration-500">
          {err && (
            <div className="alert alert-danger mb-6 animate-in slide-in-from-top-2" role="alert">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5" autoComplete="off">
            <div>
            <label className="label" htmlFor="username">{translate("Username", language)}</label>
              <div className="input-wrapper">
                <Dna className="input-icon" size={20} />
                <input
                  id="username"
                  type="text"
                  className="input input-with-icon"
                  placeholder={translate("Masukkan username", language)}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
            <label className="label" htmlFor="password">{translate("Password", language)}</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input input-with-icon pr-12"
                  placeholder={translate("Masukkan password", language)}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sage-600 transition-colors"
                  aria-label={translate(showPassword ? "Sembunyikan password" : "Tampilkan password", language)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full justify-center group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{translate("Memeriksa...", language)}</span>
                </>
              ) : (
                <>
                  <span>{translate("Masuk", language)}</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm font-medium text-sage-700 hover:text-sage-800 hover:underline">
              Lupa kata sandi?
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              {translate("Belum punya akun?", language)}{" "}
              <Link href="/register" className="text-sage-700 font-medium hover:text-sage-800 transition-colors">
                {translate("Daftar Sekarang", language)}
              </Link>
            </p>
          </div>

        </div>

        <div className="text-center mt-6 animate-in fade-in duration-700 delay-300">
          <p className="text-xs text-slate-400">
            {translate("BioLearn AI — Platform Pembelajaran Biologi SMA Berbasis AI", language)}
          </p>
        </div>
      </div>
    </div>
  );
}
