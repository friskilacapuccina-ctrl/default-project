"use client";
import Link from "next/link";
import { BookOpen, Video, Bot, ClipboardCheck, TrendingUp, ArrowRight, CheckCircle2, Sparkles, Brain, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const features = [
  { icon: ClipboardCheck, title: "Pretest & Posttest", desc: "Soal pilihan ganda dengan penilaian otomatis di server.", color: "from-aurora-700 to-aurora-900", bg: "bg-aurora-50" },
  { icon: BookOpen, title: "6 Materi Terstruktur", desc: "Sel, jaringan, pencernaan, pernapasan, peredaran darah, ekosistem.", color: "from-aurora-700 to-aurora-900", bg: "bg-aurora-50" },
  { icon: Video, title: "Video Pembelajaran", desc: "Minimal 1 video kurikulum untuk setiap materi.", color: "from-aurora-700 to-aurora-900", bg: "bg-aurora-50" },
  { icon: Bot, title: "AI Tutor Cerdas", desc: "Tanya jawab Biologi dengan konteks materi yang sedang dibuka.", color: "from-aurora-700 to-aurora-900", bg: "bg-aurora-50" },
  { icon: Brain, title: "Progress Real-time", desc: "Pelacakan progres nyata dari aktivitas belajar harian.", color: "from-aurora-700 to-aurora-900", bg: "bg-aurora-50" },
  { icon: TrendingUp, title: "Analytics Komprehensif", desc: "Perbandingan skor pretest vs posttest untuk siswa, guru, & admin.", color: "from-aurora-700 to-aurora-900", bg: "bg-aurora-50" },
];

const steps = [
  { step: "01", title: "Pretest", desc: "Ukur kemampuan awalmu" },
  { step: "02", title: "Materi", desc: "Pelajari 6 materi Biologi terstruktur" },
  { step: "03", title: "Video", desc: "Tonton video pembelajaran kurikulum" },
  { step: "04", title: "AI Tutor", desc: "Bertanya bebas dengan konteks materi" },
  { step: "05", title: "Posttest", desc: "Lihat perkembangan setelah belajar" },
  { step: "06", title: "Evaluasi", desc: "Lihat progres & perbandingan skor" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#edf4e2] dark:bg-[#0d1b13]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#173b2c] dark:border-white/5 dark:bg-[#0a1911]">
        <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-[#dce9ae] flex items-center justify-center shadow-lg shadow-black/15">
              <Leaf className="w-6 h-6 text-[#24543a]" strokeWidth={2.2} />
            </span>
            <span className="font-bold text-xl text-[#f4f7ea]">BioLearn AI</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <div className="hidden items-center gap-4 md:flex">
            <Link href="/login" className="rounded-xl border border-white/25 px-5 py-2.5 text-sm font-medium text-[#f4f7ea] transition-colors hover:bg-white/10">Masuk</Link>
            <Link href="/register" className="rounded-xl bg-[#dce9ae] px-5 py-2.5 text-sm font-semibold text-[#173b2c] shadow-lg shadow-black/15 transition-colors hover:bg-[#e8efc8]">Mulai Gratis</Link>
            </div>
          </div>
        </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex min-h-[calc(100svh-73px)] items-center overflow-hidden bg-gradient-to-br from-[#173b2c] via-[#1e4b35] to-[#285b3d] text-[#f4f7ea] dark:from-[#0b1b12] dark:via-[#102219] dark:to-[#142a1c]">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#80b155]/15 blur-3xl" />
        <div className="absolute -bottom-64 right-0 h-[500px] w-[500px] rounded-full bg-[#dce9ae]/10 blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dce9ae]/20 bg-[#dce9ae]/10 px-4 py-2 text-sm font-medium text-[#e6efc7] animate-in fade-in">
              <Sparkles className="h-4 w-4 text-[#c1d98c]" />
              Platform Pembelajaran Biologi SMA Berbasis AI
            </div>
            
            {/* Headline */}
            <h1 className="mb-8 text-4xl font-extrabold leading-tight tracking-tight text-[#f4f7ea] animate-in slide-in-from-bottom-4 duration-500 md:text-6xl lg:text-7xl">
              Biologi Lebih Hidup,<br />
              <span className="text-[#c1d98c]">Belajar Lebih Seru.</span>
            </h1>
            
            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100 sm:flex-row">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#dce9ae] px-8 py-4 text-lg font-semibold text-[#173b2c] shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#e8efc8]">
                Mulai Belajar Gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-8 py-4 text-lg font-medium text-[#f4f7ea] transition-colors hover:bg-white/10">
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="section container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-in fade-in">
          <p className="badge bg-sage-100 text-sage-800 mb-4">Fitur Unggulan</p>
          <h2 className="page-title">Semua yang Dibutuhkan untuk Belajar Biologi</h2>
          <p className="page-subtitle">Platform lengkap dengan alur belajar terstruktur dan teknologi AI terkini</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={i < 2 ? "/pretest" : i < 3 ? "/materi" : i < 4 ? "/video" : i < 5 ? "/ai-tutor" : "/progress"} className="feature-card group">
                <div className={`feature-icon ${feature.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="section bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-in fade-in">
            <p className="badge bg-sage-100 text-sage-800 mb-4">Cara Belajar</p>
            <h2 className="page-title">Alur Belajar Terstruktur 6 Langkah</h2>
            <p className="page-subtitle">Dirancang berdasarkan penelitian pembelajaran efektif untuk hasil maksimal</p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:absolute top-10 left-1/2 -translate-x-1/2 w-px h-[calc(100%-80px)] bg-gradient-to-b from-sage-200 to-transparent" />
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
              {steps.map((step, i) => (
                <div key={step.step} className="step flex-1 relative" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`step-circle bg-white border-4 ${i <= 1 ? 'step-completed' : i === 2 ? 'step-active' : 'step-pending'} border-sage-200 shadow-lg`}>
                    {i <= 1 ? (
                      <CheckCircle2 className="w-5 h-5 text-sage-600" />
                    ) : (
                      <span className={cn(
                        "font-bold",
                        i === 2 ? "text-sage-600" : "text-slate-300"
                      )}>
                        {step.step}
                      </span>
                    )}
                  </div>
                  <p className="step-label animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 0.1 + 0.2}s` }}>
                    {step.title}
                  </p>
                  <p className="text-sm text-slate-500 text-center mt-1 animate-in fade-in duration-500" style={{ animationDelay: `${i * 0.1 + 0.3}s` }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-aurora-950 py-12 text-slate-400 dark:bg-[#09170f]">
        <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce9ae]">
                  <Leaf className="h-6 w-6 text-[#24543a]" strokeWidth={2.2} />
                </span>
                <span className="font-bold text-xl text-white">BioLearn AI</span>
              </Link>
              <p className="text-sm text-slate-500 max-w-xs">Platform pembelajaran Biologi SMA berbasis AI untuk generasi penerus yang cerdas.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/materi" className="hover:text-sage-400 transition-colors">Materi Biologi</Link></li>
                <li><Link href="/video" className="hover:text-sage-400 transition-colors">Video Pembelajaran</Link></li>
                <li><Link href="/ai-tutor" className="hover:text-sage-400 transition-colors">AI Tutor</Link></li>
                <li><Link href="/manual-book" className="hover:text-sage-400 transition-colors">Buku Petunjuk</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Project</h4>
              <p className="text-sm text-slate-500">Mata Kuliah: Pengembangan Bahan Ajar</p>
              <p className="text-sm text-slate-500 mt-1">Prodi: Pendidikan Teknologi Informasi</p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">BioLearn AI — Project Pengembangan Bahan Ajar • Pendidikan Teknologi Informasi</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-500 hover:text-sage-400 transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.81 1.102.81 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
