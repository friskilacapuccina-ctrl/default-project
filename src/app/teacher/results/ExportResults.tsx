"use client";

import { Download } from "lucide-react";

type AttemptRow = { username: string; score: number; correctCount: number; wrongCount: number; completedAt: string };

export function ExportResults({ pretests, posttests }: { pretests: AttemptRow[]; posttests: AttemptRow[] }) {
  function exportCsv() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [["Jenis Tes", "Username", "Nilai", "Benar", "Salah", "Tanggal"],
      ...pretests.map((row) => ["Pretest", row.username, row.score, row.correctCount, row.wrongCount, row.completedAt]),
      ...posttests.map((row) => ["Posttest", row.username, row.score, row.correctCount, row.wrongCount, row.completedAt])];
    const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "hasil-belajar-siswa.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return <button type="button" className="btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Ekspor CSV</button>;
}
