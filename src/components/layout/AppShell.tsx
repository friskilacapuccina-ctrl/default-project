import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserCaption } from "@/components/layout/LanguageToggle";

export async function AppShell({ children, allow, wide = false }: { children: React.ReactNode; allow?: string[]; wide?: boolean }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (allow && !allow.includes(user.role)) {
    redirect(user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher" : "/dashboard");
  }
  return (
    <div data-role={user.role} className="min-h-screen md:flex">
      <Sidebar role={user.role} name={user.name} />
      <div className="min-w-0 flex-1 bg-gradient-to-br from-[#edf4e2] via-[#f2f5e9] to-[#e5efdb] dark:from-[#0d1b13] dark:via-[#122419] dark:to-[#172b1e]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sage-200/70 bg-[#f6f8ef]/90 px-4 py-3 backdrop-blur-xl dark:border-[#2b4331] dark:bg-[#14271c]/90 md:px-6 md:py-4">
          <p className="font-semibold text-[#24543a] dark:text-[#d8e8c6]">BioLearn AI</p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserCaption name={user.name} role={user.role} className="hidden text-xs text-slate-500 dark:text-[#aab9a7] sm:block" />
          </div>
        </header>
        <main className={`w-full p-4 pb-24 md:p-8 md:pb-8 ${wide ? "max-w-none" : "mx-auto max-w-5xl"}`}>{children}</main>
      </div>
      <MobileNav role={user.role} />
    </div>
  );
}
