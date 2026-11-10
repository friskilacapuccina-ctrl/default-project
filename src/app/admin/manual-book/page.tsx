import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { ManualBookForm } from "./ManualBookForm";

export default async function AdminManualBook() {
  const book = await db.manualBook.findFirst({ orderBy: { updatedAt: "desc" } });
  return <AppShell allow={["ADMIN"]}>
    <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Buku Petunjuk</h1><p className="mt-1 text-sm text-slate-600">Kelola metadata dan tautan PDF yang digunakan semua role.</p></div>
    <ManualBookForm initial={{ title: book?.title ?? "Buku Petunjuk BioLearn AI", description: book?.description ?? "", fileName: book?.fileName ?? "", fileUrl: book?.fileUrl ?? "", version: book?.version ?? "1.0" }} />
    <p className="mt-3 text-xs text-slate-500">Untuk file lokal, simpan PDF pada folder <code className="rounded bg-slate-100 px-1">public/manuals</code>, lalu masukkan path seperti <code className="rounded bg-slate-100 px-1">/manuals/panduan.pdf</code>. File tidak diunggah ke server dari formulir ini.</p>
  </AppShell>;
}
