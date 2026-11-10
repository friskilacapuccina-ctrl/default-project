import { createElement, isValidElement } from "react";

export function StatCard({ title, value, sub, icon, trend }: { title: string; value: string; sub?: string; icon?: React.ReactNode | React.ElementType; trend?: string }) {
  const iconNode = isValidElement(icon) ? icon : icon ? createElement(icon as React.ElementType, { className: "w-6 h-6" }) : null;
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          {trend && (
            <p className={cn("text-xs font-medium mt-1", trend.startsWith("+") || trend.startsWith("-") && trend.startsWith("-") ? "text-red-600" : "text-green-600")}>
              {trend}
            </p>
          )}
        </div>
        {iconNode && <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">{iconNode}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="bg-sage-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function LoadingState({ text = "Memuat..." }: { text?: string }) {
  return <div className="card text-center text-sm text-slate-500 animate-pulse">{text}</div>;
}

export function ErrorState({ text = "Terjadi kesalahan. Coba lagi." }: { text?: string }) {
  return <div className="card text-center text-sm text-red-600 bg-red-50 border-red-100">{text}</div>;
}

export function EmptyState({ text = "Belum ada data." }: { text?: string }) {
  return <div className="card text-center text-sm text-slate-500">{text}</div>;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}