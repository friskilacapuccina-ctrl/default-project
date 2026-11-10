"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { UserActions } from "./UserActions";

export type AdminUserRow = { id: string; name: string; username: string; email: string; role: string; isActive: boolean; createdAt: string; isSelf: boolean };
const PAGE_SIZE = 12;

export function UsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("SEMUA");
  const [status, setStatus] = useState("SEMUA");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => rows.filter((user) => {
    const value = `${user.name} ${user.username} ${user.email} ${user.role}`.toLocaleLowerCase("id-ID");
    return value.includes(query.toLocaleLowerCase("id-ID")) && (role === "SEMUA" || user.role === role) && (status === "SEMUA" || (status === "AKTIF" ? user.isActive : !user.isActive));
  }), [rows, query, role, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function exportCsv() {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [["Nama", "Username", "Email", "Role", "Status", "Dibuat pada"], ...filtered.map((u) => [u.name, u.username, u.email, u.role, u.isActive ? "Aktif" : "Nonaktif", new Date(u.createdAt).toLocaleDateString("id-ID")])]
      .map((line) => line.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "daftar-pengguna.csv"; link.click(); URL.revokeObjectURL(url);
  }

  return <section className="card space-y-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama, username, email" aria-label="Cari pengguna" className="input pl-10" /></div>
      <select className="input !w-auto" value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} aria-label="Filter role"><option value="SEMUA">Semua role</option><option value="ADMIN">Admin</option><option value="TEACHER">Guru</option><option value="STUDENT">Siswa</option></select>
      <select className="input !w-auto" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter status"><option value="SEMUA">Semua status</option><option value="AKTIF">Aktif</option><option value="NONAKTIF">Nonaktif</option></select>
      <button type="button" className="btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Ekspor CSV</button>
    </div>
    <div className="flex items-center justify-between text-sm text-slate-500"><span>{filtered.length} akun cocok</span>{filtered.length > 0 && <span>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span>}</div>
    {filtered.length === 0 ? <p className="py-9 text-center text-slate-500">Tidak ada pengguna yang cocok.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm">
      <thead><tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Pengguna</th><th className="p-3">Email</th><th className="p-3">Dibuat</th><th className="p-3 text-center">Peran</th><th className="p-3 text-right">Akses</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{visible.map((user) => <tr key={user.id} className="hover:bg-sage-50/40">
        <td className="p-3"><p className="font-semibold text-slate-900">{user.name}</p><p className="text-xs text-slate-500">@{user.username}</p></td>
        <td className="p-3 text-slate-600">{user.email}</td>
        <td className="p-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
        <td className="p-3 text-center"><span className="badge badge-primary">{user.role === "TEACHER" ? "Guru" : user.role === "STUDENT" ? "Siswa" : "Admin"}</span></td>
        <td className="p-3"><UserActions userId={user.id} username={user.username} role={user.role} isActive={user.isActive} isSelf={user.isSelf} /></td>
      </tr>)}</tbody>
    </table></div>}
    {pageCount > 1 && <div className="flex items-center justify-end gap-3"><button className="btn-secondary text-sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Sebelumnya</button><span className="text-sm text-slate-500">{currentPage}/{pageCount}</span><button className="btn-secondary text-sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Berikutnya</button></div>}
  </section>;
}
