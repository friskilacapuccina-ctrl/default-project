"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dna, Eye, EyeOff, Loader2, User, Mail, Lock, Shield, Leaf } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: "", 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); 
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error ?? "Registrasi gagal"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErr("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];
  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Buat Akun Baru</h1>
          <p className="text-slate-600">Daftar sebagai siswa dan mulai belajar Biologi dengan AI</p>
        </div>

        {/* Register Card */}
        <div className="card animate-in slide-in-from-bottom-4 duration-500">
          {err && (
            <div className="alert alert-danger mb-6 animate-in slide-in-from-top-2" role="alert">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label" htmlFor="name">Nama Lengkap</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  id="name"
                  type="text"
                  className="input input-with-icon"
                  placeholder="Nama lengkap sesuai KTP/Kartu Pelajar"
                  value={form.name}
                  onChange={set("name")}
                  required
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  id="username"
                  type="text"
                  className="input input-with-icon"
                  placeholder="Username unik (huruf, angka, _ dan .)"
                  value={form.username}
                  onChange={set("username")}
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Hanya huruf, angka, underscore (_) dan titik (.)</p>
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="email"
                  type="email"
                  className="input input-with-icon"
                  placeholder="email@domain.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input input-with-icon pr-12"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={set("password")}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sage-600 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 transition-colors ${i <= strength ? strengthColors[strength - 1] : "bg-slate-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Kekuatan: {strengthLabels[strength - 1] || "Sangat Lemah"}</p>
                </div>
              )}
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Konfirmasi Password</label>
              <div className="input-wrapper">
                <Shield className="input-icon" size={20} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`input input-with-icon pr-12 ${form.confirmPassword && form.confirmPassword !== form.password ? "input-error" : ""}`}
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full justify-center group"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mendaftar...</span>
                </>
              ) : (
                <>
                  <span>Buat Akun</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-slate-500 text-center mb-4">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-sage-700 font-medium hover:text-sage-800 transition-colors">
                Masuk Sekarang
              </Link>
            </p>
            
            <div className="text-center text-xs text-slate-500">
              <p className="flex items-center justify-center gap-1 mb-1">
                <Shield className="w-3.5 h-3.5 text-sage-600" />
                <span>Registrasi publik hanya membuat akun STUDENT</span>
              </p>
              <p className="flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5 text-sage-600" />
                <span>Guru & Admin dibuat melalui panel Admin</span>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 animate-in fade-in duration-700 delay-300">
          <p className="text-xs text-slate-400">
            BioLearn AI — Platform Pembelajaran Biologi SMA Berbasis AI
          </p>
        </div>
      </div>
    </div>
  );
}
