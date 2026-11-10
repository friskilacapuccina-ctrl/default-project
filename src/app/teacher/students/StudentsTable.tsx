"use client";

import { Fragment, useMemo, useState } from "react";
import { Download, Search, ChevronDown, ChevronUp } from "lucide-react";

export type TeacherStudentRow = {
  studentId: string;
  name: string;
  username: string;
  email: string;
  courses: string[];
  pre: number | null;
  post: number | null;
  progress: number;
  materialCount: number;
};

const PAGE_SIZE = 10;

export function TeacherStudentsTable({ rows }: { rows: TeacherStudentRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [course, setCourse] = useState("Semua kelas");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const courses = Array.from(new Set(rows.flatMap((row) => row.courses))).sort();
  const filtered = useMemo(() => rows.filter((row) => {
    const text = `${row.name} ${row.username} ${row.email} ${row.courses.join(" ")}`.toLocaleLowerCase("id-ID");
    const rowStatus = row.post !== null ? "Selesai" : row.pre !== null || row.progress > 0 ? "Berjalan" : "Baru";
    return text.includes(query.toLocaleLowerCase("id-ID")) && (status === "Semua status" || status === rowStatus) && (course === "Semua kelas" || row.courses.includes(course));
  }), [rows, query, status, course]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function exportCsv() {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csv = [
      ["Nama", "Email", "Username", "Kelas", "Pretest terbaru", "Posttest terbaru", "Materi selesai", "Total materi"],
      ...filtered.map((row) => [row.name, row.email, row.username, row.courses.join("; "), row.pre ?? "", row.post ?? "", row.progress, row.materialCount]),
    ].map((line) => line.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-siswa.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="card space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama, email, username, atau kelas" aria-label="Cari siswa" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="input !w-auto" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter status">
            <option>Semua status</option><option>Selesai</option><option>Berjalan</option><option>Baru</option>
          </select>
          <select className="input !w-auto" value={course} onChange={(event) => { setCourse(event.target.value); setPage(1); }} aria-label="Filter kelas">
            <option>Semua kelas</option>{courses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="btn-secondary" type="button" onClick={exportCsv}><Download className="h-4 w-4" /> Ekspor CSV</button>
        </div>
      </div>

      <p className="text-sm text-slate-500">Menampilkan {filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} siswa</p>
      {filtered.length === 0 ? <div className="py-10 text-center text-slate-500">Tidak ada siswa yang cocok dengan pencarian atau filter.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="p-3">Siswa</th><th className="p-3">Kelas</th><th className="p-3 text-center">Pretest</th><th className="p-3">Materi</th><th className="p-3 text-center">Posttest</th><th className="p-3 text-center">Status</th><th className="p-3 text-right">Detail</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((row) => {
                const rowStatus = row.post !== null ? "Selesai" : row.pre !== null || row.progress > 0 ? "Berjalan" : "Baru";
                const pct = row.materialCount ? Math.min(100, Math.round((row.progress / row.materialCount) * 100)) : 0;
                return <Fragment key={row.studentId}>
                  <tr className="hover:bg-sage-50/50">
            <td className="p-3"><p className="font-semibold text-slate-900">{row.name}</p><p className="text-xs text-slate-500">{row.email}</p></td>
                    <td className="max-w-56 p-3 text-slate-600">{row.courses.join(", ")}</td>
                    <td className="p-3 text-center font-semibold">{row.pre ?? "—"}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-sage-600" style={{ width: `${pct}%` }} /></div><span className="text-xs text-slate-600">{row.progress}/{row.materialCount}</span></div></td>
                    <td className="p-3 text-center font-semibold">{row.post ?? "—"}</td>
                    <td className="p-3 text-center"><span className="badge badge-primary">{rowStatus}</span></td>
                    <td className="p-3 text-right"><button type="button" className="btn-ghost btn-sm" onClick={() => setExpanded(expanded === row.studentId ? null : row.studentId)} aria-expanded={expanded === row.studentId} aria-label={`Tampilkan detail ${row.name}`}>{expanded === row.studentId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button></td>
                  </tr>
                  {expanded === row.studentId && <tr key={`${row.studentId}-detail`}><td colSpan={7} className="bg-sage-50/50 px-5 py-4 text-sm text-slate-700"><div className="flex flex-wrap gap-x-8 gap-y-2"><span><b>Nama:</b> {row.name}</span><span><b>Email:</b> {row.email}</span><span><b>Username:</b> {row.username}</span><span><b>Kelas:</b> {row.courses.join(", ") || "Belum ada kelas"}</span><span><b>Progres materi:</b> {row.progress} dari {row.materialCount}</span><span><b>Nilai terbaru:</b> Pretest {row.pre ?? "belum dikerjakan"} · Posttest {row.post ?? "belum dikerjakan"}</span></div></td></tr>}
                </Fragment>;
              })}
            </tbody>
          </table>
        </div>
      )}
      {pageCount > 1 && <div className="flex items-center justify-end gap-3"><button className="btn-secondary text-sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Sebelumnya</button><span className="text-sm text-slate-500">Halaman {currentPage}/{pageCount}</span><button className="btn-secondary text-sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Berikutnya</button></div>}
    </section>
  );
}
