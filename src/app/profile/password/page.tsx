import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";
import { KeyRound } from "lucide-react";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <AppShell>
      <div className="animate-in fade-in duration-500 max-w-xl">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 mb-2">
          <KeyRound className="w-8 h-8 text-sage-600" /> Ganti Password
        </h1>
        <p className="text-slate-600 mb-8">Password disimpan dalam bentuk hash (bcrypt) dan tidak pernah dikirim ke browser.</p>
        <div className="card p-6">
          <PasswordForm />
        </div>
      </div>
    </AppShell>
  );
}
