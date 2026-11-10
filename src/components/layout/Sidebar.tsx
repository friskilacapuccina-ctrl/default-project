"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  ClipboardCheck,
  BookOpen,
  Video,
  Bot,
  FileCheck2,
  BookMarked,
  TrendingUp,
  User,
  LogOut,
  Users,
  GraduationCap,
  Settings,
  BarChart3,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Gamepad2,
  MoreHorizontal,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { translate, useLanguage } from "@/components/layout/LanguageProvider";

const MENUS: Record<
  string,
  Array<{ href: string; label: string; icon: React.ElementType }>
> = {
  STUDENT: [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/pretest", label: "Pretest", icon: ClipboardCheck },
    { href: "/materi", label: "Materi", icon: BookOpen },
    { href: "/video", label: "Video Pembelajaran", icon: Video },
    { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
    { href: "/ruang-santai", label: "Ruang Santai", icon: Gamepad2 },
    { href: "/posttest", label: "Posttest", icon: FileCheck2 },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/manual-book", label: "Buku Petunjuk", icon: BookMarked },
    { href: "/profile", label: "Profile", icon: User },
  ],
  TEACHER: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/materials", label: "Materi", icon: BookOpen },
    { href: "/teacher/videos", label: "Video", icon: Video },
    { href: "/teacher/students", label: "Data Siswa", icon: Users },
    { href: "/teacher/enrollment", label: "Enrollment", icon: UserCheck },
    { href: "/teacher/assessments", label: "Kelola Tes", icon: ClipboardCheck },
    { href: "/teacher/results", label: "Hasil Belajar", icon: FileCheck2 },
    { href: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/manual-book", label: "Buku Petunjuk", icon: BookMarked },
    { href: "/profile", label: "Profile", icon: User },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/enrollment", label: "Enrollment", icon: GraduationCap },
    { href: "/admin/materials", label: "Materi", icon: BookOpen },
    { href: "/admin/videos", label: "Video", icon: Video },
    { href: "/admin/results", label: "Hasil & Analytics", icon: BarChart3 },
    { href: "/admin/activity", label: "Aktivitas Admin", icon: History },
    { href: "/manual-book", label: "Manual Book", icon: BookMarked },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/profile", label: "Profile", icon: User },
  ],
};

export function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useLanguage();
  const items = MENUS[role] ?? MENUS.STUDENT;

  useEffect(() => {
    setCollapsed(
      window.localStorage.getItem("biolearn-sidebar") === "collapsed"
    );
  }, []);

  function toggleSidebar() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(
        "biolearn-sidebar",
        next ? "collapsed" : "expanded"
      );
      return next;
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen min-h-screen shrink-0 flex-col border-r border-[#315a43] bg-gradient-to-b from-[#173b2c] to-[#214a35] transition-[width] duration-200 dark:border-[#b9ce9f] dark:from-[#dce9c9] dark:to-[#c9dcaf] lg:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "border-b border-white/10 bg-white/[0.03] p-5 dark:border-[#b9ce9f] dark:bg-white/25",
          collapsed && "px-3"
        )}
      >
        <div
          className={cn(
            "flex",
            collapsed
              ? "flex-col items-center gap-3"
              : "items-center justify-between gap-2"
          )}
        >
          <Link
            href="/"
            title="BioLearn AI"
            className={cn(
              "flex items-center gap-2",
              collapsed && "justify-center"
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce9ae] shadow-md shadow-black/10 dark:bg-[#9ab976]">
              <Leaf className="h-6 w-6 text-[#24543a]" strokeWidth={2.2} />
            </span>
            {!collapsed && (
              <span className="text-xl font-bold text-[#f4f7ea] dark:text-[#23472d]">
                BioLearn AI
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            title={translate(collapsed ? "Buka panel navigasi" : "Ciutkan panel navigasi", language)}
            aria-label={
              translate(collapsed ? "Buka panel navigasi" : "Ciutkan panel navigasi", language)
            }
            aria-expanded={!collapsed}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#d9e7d6] transition-colors hover:bg-white/10 hover:text-white focus:outline-none dark:text-[#315d3d] dark:hover:bg-[#b5cc99] dark:hover:text-[#1f3d29]"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>
        {!collapsed && (
          <p className="mt-2 text-xs text-[#c6d7c5] dark:text-[#426247]">
            {name} • {translate(role, language)}
          </p>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((m, index) => {
          const active =
            pathname === m.href ||
            (m.href !== "/dashboard" &&
              m.href !== "/teacher" &&
              m.href !== "/admin" &&
              pathname.startsWith(m.href));
          return (
            <Link
              key={m.href}
              href={m.href}
              title={collapsed ? translate(m.label, language) : undefined}
              aria-label={collapsed ? translate(m.label, language) : undefined}
              className={cn(
                "nav-link relative overflow-hidden group",
                collapsed && "justify-center px-0",
                active ? "nav-link-active" : "nav-link-inactive"
              )}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <m.icon
                size={18}
                className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
              />
              {!collapsed && <span className="flex-1 truncate">{translate(m.label, language)}</span>}
              {active && !collapsed && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sage-600" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 bg-black/[0.06] p-3 dark:border-[#b9ce9f] dark:bg-[#b8ce9e]">
        <button
          onClick={logout}
          className={cn(
            "nav-link w-full text-[#f0b8ad] hover:bg-[#8b3d35]/25 hover:text-[#ffd6cc] dark:text-[#8a3932] dark:hover:bg-[#f0cbc2] dark:hover:text-[#64241f]",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>{translate("Logout", language)}</span>}
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const items = (MENUS[role] ?? MENUS.STUDENT).slice(0, 6);
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = items.slice(0, 5);
  const secondaryItems = [...items.slice(5), ...(MENUS[role] ?? MENUS.STUDENT).slice(6)];
  const isActive = (href: string) => pathname === href ||
    (href !== "/dashboard" && href !== "/teacher" && href !== "/admin" && pathname.startsWith(`${href}/`));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav aria-label="Navigasi ponsel" className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-sage-200 bg-white/95 py-2 shadow-xl backdrop-blur-xl lg:hidden">
      {primaryItems.map((m, index) => (
        <Link
          key={m.href}
          href={m.href}
          aria-label={translate(m.label, language)}
          className={cn(
            "flex min-w-12 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition-all duration-200",
            isActive(m.href)
              ? "bg-sage-100 text-sage-700"
              : "text-slate-500 active:text-slate-700"
          )}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          <m.icon size={20} /><span className="max-w-14 truncate">{translate(m.label, language)}</span>
        </Link>
      ))}
      <div className="relative flex items-center">
        {moreOpen && <div className="absolute bottom-full right-0 mb-3 grid max-h-[60vh] min-w-52 gap-1 overflow-y-auto rounded-2xl border border-sage-200 bg-white p-2 shadow-2xl">
          {secondaryItems.map((m) => <Link key={m.href} href={m.href} onClick={() => setMoreOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", isActive(m.href) ? "bg-sage-100 font-semibold text-sage-800" : "text-slate-700 hover:bg-sage-50")}><m.icon size={18} />{translate(m.label, language)}</Link>)}
        </div>}
        <button type="button" aria-label={translate("Menu lainnya", language)} aria-expanded={moreOpen} onClick={() => setMoreOpen((open) => !open)} className={cn("flex min-w-12 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px]", moreOpen ? "bg-sage-100 text-sage-700" : "text-slate-500")}><MoreHorizontal size={20} /><span>{translate("Lainnya", language)}</span></button>
      </div>
      <button
        onClick={logout}
        aria-label="Logout"
        className="flex min-w-12 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut size={20} /><span>{translate("Keluar", language)}</span>
      </button>
    </nav>
  );
}
