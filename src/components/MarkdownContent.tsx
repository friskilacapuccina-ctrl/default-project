import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-sage-100 px-1 py-0.5 text-[0.9em] dark:bg-[#294532]">{part.slice(1, -1)}</code>;
    return part;
  });
}

export function MarkdownContent({ text, title }: { text: string; title?: string }) {
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  const flushList = (key: string) => {
    if (!listItems.length) return;
    nodes.push(<ul key={`list-${key}`} className="mb-4 list-disc space-y-1 pl-6 text-sm leading-relaxed text-slate-700 dark:text-[#d6e1d1]">{listItems.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
    listItems = [];
  };

  text.split("\n").forEach((line, index) => {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (listMatch) { listItems.push(listMatch[1]); return; }
    flushList(String(index));
    if (!trimmed) return;
    if (trimmed.startsWith("# ") && trimmed.slice(2).trim() === title?.trim()) return;
    if (trimmed.startsWith("# ")) nodes.push(<h2 key={index} className="mb-3 mt-2 border-b border-slate-100 pb-2 text-2xl font-bold text-slate-900 dark:border-[#304636] dark:text-[#e5eddf]">{inline(trimmed.slice(2))}</h2>);
    else if (trimmed.startsWith("## ")) nodes.push(<h2 key={index} className="mb-3 mt-7 text-lg font-semibold text-sage-800 dark:text-[#dce9c9]">{inline(trimmed.slice(3))}</h2>);
    else if (trimmed.startsWith("### ")) nodes.push(<h3 key={index} className="mb-2 mt-5 text-base font-semibold text-slate-800 dark:text-[#e0e9db]">{inline(trimmed.slice(4))}</h3>);
    else if (trimmed.startsWith("> ")) nodes.push(<blockquote key={index} className="mb-4 rounded-r-xl border-l-4 border-sage-500 bg-sage-50 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:bg-[#203328] dark:text-[#d6e1d1]">{inline(trimmed.slice(2))}</blockquote>);
    else if (/^[-*_]{3,}$/.test(trimmed)) nodes.push(<hr key={index} className="my-5 border-slate-200 dark:border-[#304636]" />);
    else nodes.push(<p key={index} className="mb-3 text-sm leading-7 text-slate-700 dark:text-[#d6e1d1]">{inline(trimmed)}</p>);
  });
  flushList("end");
  return <>{nodes}</>;
}
