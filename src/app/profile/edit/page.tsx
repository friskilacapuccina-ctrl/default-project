import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { Settings } from "lucide-react";

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <AppShell>
      <div className="animate-in fade-in duration-500 max-w-xl">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-sage-600" /> Edit Profil
        </h1>
        <p className="text-slate-600 mb-8">Perbarui nama lengkap Anda. Username, email, dan role tidak dapat diubah sendiri.</p>
        <div className="card p-6">
          <ProfileForm defaultName={user.name} />
        </div>
      </div>
    </AppShell>
  );
}
