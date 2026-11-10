"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { translate, useLanguage } from "@/components/layout/LanguageProvider";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("biolearn-theme", nextDark ? "dark" : "light");
    setDark(nextDark);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <LanguageToggle />
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={translate(dark ? "Aktifkan mode terang" : "Aktifkan mode gelap", language)}
        title={translate(dark ? "Mode terang" : "Mode gelap", language)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sage-200 bg-white/70 text-sage-800 transition-colors hover:bg-sage-100 focus:outline-none dark:border-[#36513b] dark:bg-[#203629] dark:text-[#d4e5bd] dark:hover:bg-[#2a4532]"
      >
        {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}
