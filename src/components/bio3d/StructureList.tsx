"use client";

import { ListTree } from "lucide-react";
import type { BioStructure } from "./types";

type Props = {
  structures: BioStructure[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  compact?: boolean;
};

/** Daftar bagian sekaligus legenda warna untuk model aktif. */
export function StructureList({ structures, selectedId, onSelect, compact = false }: Props) {
  if (compact) {
    return (
      <section
        className="overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-md dark:border-[#405747] dark:bg-[#17271d]/95"
        aria-label="Pilih bagian model"
      >
        <div className="flex items-center justify-between gap-2 px-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
            Daftar Bagian
          </p>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            Geser untuk melihat semua · {structures.length}
          </span>
        </div>
        <ul className="flex snap-x gap-1.5 overflow-x-auto overscroll-x-contain px-2.5 pb-2 pt-1">
          {structures.map((structure) => {
            const active = structure.id === selectedId;
            return (
              <li key={structure.id} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : structure.id)}
                  aria-pressed={active}
                  aria-label={`${structure.number}. ${structure.name}${structure.scientificName ? `, ${structure.scientificName}` : ""}`}
                  className={`flex h-9 max-w-36 items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-500 ${
                    active
                      ? "bg-aurora-800 text-white shadow-sm"
                      : "bg-slate-100/90 text-slate-700 hover:bg-aurora-100 dark:bg-[#26392c] dark:text-slate-200 dark:hover:bg-[#304a36]"
                  }`}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: structure.color }}
                  >
                    {structure.number}
                  </span>
                  <span className="truncate">{structure.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-aurora-200 bg-white shadow-sm dark:border-[#304636] dark:bg-[#192b20]"
      aria-label="Daftar bagian model"
    >
      <div className="flex items-center justify-between gap-3 border-b border-aurora-100 bg-aurora-50/80 px-4 py-3 dark:border-[#304636] dark:bg-[#203829]">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-aurora-900 dark:text-[#d3e4bf]">
          <ListTree className="h-4 w-4" aria-hidden="true" />
          Daftar Bagian
        </h3>
        <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-[#192b20] dark:text-slate-300">
          {structures.length} bagian
        </span>
      </div>

      <ul className="max-h-[280px] divide-y divide-slate-100 overflow-y-auto overscroll-contain dark:divide-[#304636] lg:max-h-[320px]">
        {structures.map((structure) => {
          const active = structure.id === selectedId;
          return (
            <li key={structure.id}>
              <button
                type="button"
                onClick={() => onSelect(active ? null : structure.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aurora-500 ${
                  active
                    ? "bg-aurora-800 text-white"
                    : "bg-white text-slate-700 hover:bg-aurora-50/80 dark:bg-[#192b20] dark:text-slate-200 dark:hover:bg-[#22392b]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    active ? "text-aurora-950" : "text-white"
                  }`}
                  style={{
                    background: active ? "#dce8c9" : structure.color,
                    boxShadow: active ? "none" : "inset 0 0 0 1px rgba(0,0,0,0.12)",
                  }}
                >
                  {structure.number}
                </span>
                <span className="min-w-0 flex-1 py-0.5">
                  <span className="block truncate text-sm font-semibold">{structure.name}</span>
                  {structure.scientificName && (
                    <span className={`mt-0.5 block truncate text-xs italic ${active ? "text-aurora-100" : "text-slate-500 dark:text-slate-400"}`}>
                      {structure.scientificName}
                    </span>
                  )}
                </span>
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ background: structure.color }}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
