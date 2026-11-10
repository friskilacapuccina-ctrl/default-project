import { AppShell } from "@/components/layout/AppShell";
import { MaterialManager } from "@/components/MaterialManager";
import { db } from "@/lib/db";

export default async function TeacherMaterials() {
  const materials = await db.material.findMany({
    orderBy: { order: "asc" },
    select: { id: true, order: true, title: true, slug: true, description: true, learningObjectives: true, content: true, published: true },
  });

  return (
    <AppShell allow={["TEACHER"]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Materi Pembelajaran</h1>
        <p className="mt-1 text-sm text-slate-500">Tambahkan materi baru, lalu lihat, edit, atur publikasi, atau hapus dari daftar ini.</p>
      </div>
      <MaterialManager materials={materials} />
    </AppShell>
  );
}
