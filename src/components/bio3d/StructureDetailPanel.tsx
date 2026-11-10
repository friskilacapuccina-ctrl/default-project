"use client";

import { ArrowLeft, Info, MousePointerClick, X } from "lucide-react";
import Link from "next/link";
import type { BioStructure } from "./types";

type Props = {
  structure: BioStructure | null;
  intro: string;
  schematicNote?: string;
  legendNote?: string;
  aiHref?: string;
  onClose: () => void;
  compact?: boolean;
};

/** Penjelasan lengkap di desktop dan kartu ringkas di atas kanvas pada ponsel. */
export function StructureDetailPanel({
  structure,
  intro,
  schematicNote,
  legendNote,
  aiHref,
  onClose,
  compact = false,
}: Props) {
  if (compact) {
    return (
      <section
        className={`flex max-h-[230px] flex-col overflow-hidden rounded-xl border border-white/70 bg-white/95 shadow-xl shadow-slate-900/15 backdrop-blur-md dark:border-[#405747] dark:bg-[#17271d]/95 ${!structure ? "max-h-[88px]" : ""}`}
        aria-label={structure ? `Penjelasan ${structure.name}` : "Petunjuk memilih bagian"}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-[#304636]">
          <Info className="h-4 w-4 text-aurora-700 dark:text-[#b8d596]" aria-hidden="true" />
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-aurora-900 dark:text-[#d3e4bf]">
            {structure ? "Penjelasan Bagian" : "Jelajahi Model"}
          </p>
          {structure && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup penjelasan"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-500 dark:text-slate-300 dark:hover:bg-[#304636]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {structure ? (
          <div className="min-h-0 space-y-2 overflow-y-auto overscroll-contain p-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: structure.color }}
              >
                {structure.number}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
                  {structure.name}
                </h3>
                {structure.scientificName && (
                  <p className="truncate text-[11px] italic leading-tight text-slate-500 dark:text-slate-400">
                    {structure.scientificName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg bg-slate-50/90 px-2.5 py-2 dark:bg-[#203328]">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Deskripsi
                </h4>
                <p className="mt-0.5 text-xs leading-4 text-slate-700 dark:text-slate-200">
                  {structure.shortDescription}
                </p>
              </div>
              <div className="rounded-lg border border-aurora-100 bg-aurora-50/90 px-2.5 py-2 dark:border-[#304636] dark:bg-[#203829]">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.1em] text-aurora-800 dark:text-[#d3e4bf]">
                  Fungsi Utama
                </h4>
                <p className="mt-0.5 text-xs leading-4 text-slate-700 dark:text-slate-200">
                  {structure.mainFunction}
                </p>
              </div>
              {structure.biologicalNotes && (
                <details className="rounded-lg border border-slate-200/80 px-2.5 py-2 dark:border-[#405747]">
                  <summary className="cursor-pointer text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    Catatan biologis
                  </summary>
                  <p className="mt-1 text-xs leading-4 text-slate-600 dark:text-slate-300">
                    {structure.biologicalNotes}
                  </p>
                </details>
              )}
            </div>
          </div>
        ) : (
          <p className="px-3 py-2 text-xs leading-4 text-slate-600 dark:text-slate-300">{intro}</p>
        )}
      </section>
    );
  }

  if (!structure) {
    return (
      <section className="rounded-2xl border border-aurora-200 bg-aurora-50 p-5 dark:border-[#304636] dark:bg-[#192b20]">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-aurora-900 dark:text-[#d3e4bf]">
          <MousePointerClick className="h-4 w-4" aria-hidden="true" />
          Pilih Bagian
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{intro}</p>
        {(schematicNote || legendNote) && (
          <div className="mt-4 flex items-start gap-2 border-t border-aurora-200/70 pt-3 text-xs leading-relaxed text-slate-500 dark:border-[#304636] dark:text-slate-400">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>{schematicNote ?? legendNote}</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-aurora-200 bg-white shadow-sm dark:border-[#304636] dark:bg-[#192b20]">
      <div className="flex items-center gap-3 border-b border-aurora-100 bg-aurora-900 px-4 py-3 text-white dark:border-[#304636]">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-8 items-center gap-2 rounded-lg pr-2 text-xs font-medium text-aurora-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar
        </button>
        <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
          Penjelasan bagian
        </span>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: structure.color, boxShadow: `0 2px 8px ${structure.color}66` }}
          >
            {structure.number}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-aurora-700 dark:text-[#b8d596]">
              Nomor {structure.number}
            </p>
            <h3 className="mt-0.5 break-words text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
              {structure.name}
            </h3>
            {structure.scientificName && (
              <p className="mt-1 break-words text-sm italic text-slate-500 dark:text-slate-400">
                {structure.scientificName}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-[#304636]">
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Deskripsi
            </h4>
            <p className="break-words text-sm leading-6 text-slate-700 dark:text-slate-200">
              {structure.shortDescription}
            </p>
          </div>

          <div className="rounded-xl border border-aurora-100 bg-aurora-50/80 p-4 dark:border-[#304636] dark:bg-[#203829]">
            <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-aurora-800 dark:text-[#d3e4bf]">
              Fungsi Utama
            </h4>
            <p className="break-words text-sm leading-6 text-slate-700 dark:text-slate-200">
              {structure.mainFunction}
            </p>
          </div>

          {structure.biologicalNotes && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Catatan Biologis
              </h4>
              <p className="break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                {structure.biologicalNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {aiHref && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-[#304636] sm:px-5">
          <Link
            href={aiHref}
            className="flex min-h-10 w-full items-center justify-center rounded-xl bg-aurora-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-aurora-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-500 focus-visible:ring-offset-2"
          >
            Tanya AI Tutor
          </Link>
        </div>
      )}
    </section>
  );
}
