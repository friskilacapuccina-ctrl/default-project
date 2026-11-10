"use client";

import { Download } from "lucide-react";

type Row = { username: string; test: string; score: number; correctCount: number; wrongCount: number; completedAt: string };
export function ExportAdminResults({ pretests, posttests }: { pretests: Row[]; posttests: Row[] }) {
  function exportCsv() {
    const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows: Array<Array<string | number>> = [
      ["Username", "Jenis tes", "Nilai", "Benar", "Salah", "Waktu"],
      ...pretests.map((row) => [row.username, row.test, row.score, row.correctCount, row.wrongCount, row.completedAt]),
      ...posttests.map((row) => [row.username, row.test, row.score, row.correctCount, row.wrongCount, row.completedAt]),
    ];
    const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "hasil-analytics-admin.csv"; link.click(); URL.revokeObjectURL(url);
  }
  return <button className="btn-secondary" type="button" onClick={exportCsv}><Download className="h-4 w-4" /> Ekspor CSV</button>;
}
