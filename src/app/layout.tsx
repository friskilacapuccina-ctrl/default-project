import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/layout/LanguageProvider";

export const metadata: Metadata = {
  title: "BioLearn AI - Pembelajaran Biologi SMA",
  description: "Platform pembelajaran Biologi SMA berbasis AI dengan materi, video, pretest, posttest, dan AI Tutor.",
};

// Semua halaman memakai database MySQL → render dinamis saat request,
// bukan saat build (database tidak tersedia ketika `next build`).
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem("biolearn-theme") === "dark") document.documentElement.classList.add("dark"); const language = localStorage.getItem("biolearn-language"); if (language === "en" || language === "id") document.documentElement.lang = language; } catch {}`,
          }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
