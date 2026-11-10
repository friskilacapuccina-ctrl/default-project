import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CreateUserForm } from "./CreateUserForm";
import { Users, UserPlus } from "lucide-react";
import { UsersTable, type AdminUserRow } from "./UsersTable";

export default async function AdminUsers() {
  const [users, me] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, username: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { username: "asc" },
    }),
    getCurrentUser(),
  ]);
  const rows: AdminUserRow[] = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), isSelf: me?.id === u.id }));

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900"><Users className="h-8 w-8 text-sage-600" />Manajemen Pengguna</h1><p className="mt-1 text-slate-600">Buat akun, atur peran, dan kelola akses pengguna.</p></div>
          <span className="badge badge-primary">{users.length} akun</span>
        </div>

        <section className="card mb-7">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><UserPlus className="h-5 w-5 text-sage-600" />Buat akun</h2>
          <CreateUserForm />
        </section>

        <UsersTable rows={rows} />
      </div>
    </AppShell>
  );
}
