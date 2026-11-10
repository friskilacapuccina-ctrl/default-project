"use client";

import { Globe2 } from "lucide-react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { translate, useLanguage } from "@/components/layout/LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={language === "id" ? "Pilih bahasa" : "Choose language"}
        title={language === "id" ? "Pilih bahasa" : "Choose language"}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-sage-200 bg-white/70 px-2.5 text-sage-800 shadow-sm transition-colors hover:bg-sage-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ba658] dark:border-[#36513b] dark:bg-[#203629] dark:text-[#d4e5bd] dark:hover:bg-[#2a4532]"
      >
        <Globe2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-[11px] font-extrabold tracking-wide">{language === "id" ? "IND" : "ENG"}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open ? (
        <div role="menu" aria-label={language === "id" ? "Pilih bahasa" : "Choose language"} className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-sage-200 bg-white p-1.5 text-slate-800 shadow-xl dark:border-[#405747] dark:bg-[#1d3024] dark:text-[#e6efdc]">
          <button type="button" role="menuitemradio" aria-checked={language === "id"} onClick={() => { setLanguage("id"); setOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-sage-50 dark:hover:bg-[#294532]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4e2] text-base dark:bg-[#304a32]" aria-hidden="true">🇮🇩</span>
            <span className="flex-1"><span className="block font-semibold">Bahasa Indonesia</span><span className="block text-[11px] text-slate-500 dark:text-[#aab9a7]">IND</span></span>
            {language === "id" ? <Check className="h-4 w-4 text-sage-700 dark:text-[#b8d596]" /> : null}
          </button>
          <button type="button" role="menuitemradio" aria-checked={language === "en"} onClick={() => { setLanguage("en"); setOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-sage-50 dark:hover:bg-[#294532]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4e2] text-base dark:bg-[#304a32]" aria-hidden="true">🇬🇧</span>
            <span className="flex-1"><span className="block font-semibold">English</span><span className="block text-[11px] text-slate-500 dark:text-[#aab9a7]">ENG</span></span>
            {language === "en" ? <Check className="h-4 w-4 text-sage-700 dark:text-[#b8d596]" /> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function UserCaption({ name, role, className = "" }: { name: string; role: string; className?: string }) {
  const { language } = useLanguage();
  return <span className={className}>{name} • {translate(role, language)}</span>;
}
