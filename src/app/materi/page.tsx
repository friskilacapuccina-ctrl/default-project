import { AppShell } from "@/components/layout/AppShell";
import { MaterialArtwork } from "@/components/MaterialArtwork";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, CheckCircle2, Download, Clock, Sparkles, Box } from "lucide-react";

export default async function MateriPage() {
  const user = await getCurrentUser();
  const materials = await db.material.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  const progresses = user ? await db.progress.findMany({ where: { userId: user.id } }) : [];

  return (
    <AppShell allow={["STUDENT", "TEACHER", "ADMIN"]}>
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Materi Pembelajaran</h1>
            <p className="text-slate-600 mt-1">Materi utama Biologi SMA kurikulum Merdeka</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <span>{materials.length} Materi Tersedia</span>
          </div>
        </div>

        {materials.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-sage-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Materi</h3>
            <p className="text-slate-500">Materi akan ditambahkan oleh guru atau admin.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((m, index) => {
              const done = progresses.find((p) => p.materialId === m.id && p.completed);
              return (
                <Link 
                  key={m.id} 
                  href={`/materi/${m.slug}`}
                  className="card-hover group relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-transparent via-sage-100/50 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-5">
                      <span className="badge bg-sage-100 text-sage-900 inline-flex items-center gap-1">
                        <Box size={12} /> Model 3D
                      </span>
                      {done && (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Selesai
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-5">
                      <div className="transition-transform duration-300 group-hover:scale-105"><MaterialArtwork order={m.order} /></div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg text-slate-900 truncate">{m.title}</h2>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed">{m.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~15 menit baca</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="btn-primary btn-sm group">
                          Buka Materi
                          <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                        {m.fileUrl && (
                          <a href={m.fileUrl} download className="btn-secondary btn-sm">
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
