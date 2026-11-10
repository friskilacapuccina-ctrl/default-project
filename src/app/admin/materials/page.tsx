import { AppShell } from "@/components/layout/AppShell";
import { db } from "@/lib/db";
import { MaterialsViewer } from "./MaterialsViewer";

export default async function AdminMaterials() {
  const materials = await db.material.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      slug: true,
      title: true,
      description: true,
      learningObjectives: true,
      content: true,
      published: true,
    },
  });

  return (
    <AppShell allow={["ADMIN"]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Materi Pembelajaran</h1>
        <p className="mt-1 text-sm text-slate-600">
          Buka isi materi untuk ditinjau. Admin dapat menghapus materi yang tidak digunakan.
        </p>
      </div>
      <MaterialsViewer materials={materials} />
    </AppShell>
  );
}
