"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { translateText, useLanguage } from "@/components/layout/LanguageProvider";

type Msg = { role: "USER" | "ASSISTANT"; content: string };

export function AIChat({ materialId, materialTitle, suggestions }: { materialId?: string; materialTitle?: string; suggestions: string[] }) {
  const { language } = useLanguage();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ASSISTANT", content: `Halo! Materi apa yang ingin kamu pahami?${materialTitle ? ` Aku lihat kamu sedang membuka "${materialTitle}". Silakan bertanya tentang materi ini.` : ""}` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const messageList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs((current) => {
      if (current.length !== 1 || current[0].role !== "ASSISTANT") return current;
      const greeting = `Halo! Materi apa yang ingin kamu pahami?${materialTitle ? ` Aku lihat kamu sedang membuka "${materialTitle}". Silakan bertanya tentang materi ini.` : ""}`;
      return [{ role: "ASSISTANT", content: language === "en"
        ? `Hello! What would you like to learn about?${materialTitle ? ` I see you are viewing "${translateText(materialTitle, language)}." Feel free to ask about it.` : ""}`
        : greeting }];
    });
  }, [language, materialTitle]);

  useEffect(() => {
    const panel = messageList.current;
    if (panel) panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function sendMessage(message: string) {
    const userMsg = message.trim();
    if (!userMsg || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "USER", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg, conversationId: convId, materialId, language }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (language === "en" ? "AI service error" : "AI gangguan"));
      setConvId(data.conversationId);
      setMsgs((m) => [...m, { role: "ASSISTANT", content: data.reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "ASSISTANT", content: language === "en" ? "The AI Tutor is temporarily unavailable. Please try again later." : "AI Tutor sedang mengalami gangguan. Coba lagi nanti." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:h-full lg:grid-cols-[minmax(0,1fr)_280px]">
      <section aria-label="Percakapan dengan AI Tutor" className="flex min-h-[440px] min-w-0 flex-col overflow-hidden rounded-2xl border border-sage-200 bg-white shadow-sm dark:border-[#304636] dark:bg-[#17271d] lg:min-h-0">
        <div className="bg-gradient-to-r from-sage-800 to-sage-700 px-5 py-4 text-white dark:from-[#1a3827] dark:to-[#21462f]">
          <p className="flex items-center gap-2 font-semibold"><Bot size={20} /> BioLearn AI Tutor</p>
          <p className="mt-0.5 text-xs text-sage-100">Teman belajar Biologi kamu{materialTitle ? ` · Konteks: ${materialTitle}` : ""}</p>
        </div>
        <div ref={messageList} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/80 p-4 md:p-5 dark:bg-[#101c15]">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[82%] ${m.role === "USER" ? "ml-auto rounded-br-md bg-sage-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-[#304636] dark:bg-[#1c3024] dark:text-[#e1eadc]"}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="w-fit rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-[#304636] dark:bg-[#1c3024] dark:text-[#aab9a7]" role="status">AI Tutor sedang mengetik…</div>}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-3 dark:border-[#304636] dark:bg-[#17271d] md:p-4">
          <input className="input min-w-0 flex-1 dark:border-[#38503d] dark:bg-[#203328] dark:text-[#edf4e2] dark:placeholder:text-[#91a18d]" placeholder="Tanya tentang Biologi..." value={input} onChange={(e) => setInput(e.target.value)} aria-label="Pesan untuk AI Tutor" maxLength={2000} disabled={loading} />
          <button type="submit" className="btn-primary !px-4" disabled={loading || !input.trim()} aria-label="Kirim pertanyaan" title="Kirim pertanyaan"><Send size={17} /></button>
        </form>
      </section>

      <aside aria-label="Saran pertanyaan" className="rounded-2xl border border-sage-200 bg-white p-4 shadow-sm dark:border-[#304636] dark:bg-[#17271d] lg:min-h-0 lg:overflow-y-auto">
        <div className="mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-[#e4ecdc]">Saran Pertanyaan</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#aab9a7]">Pilih topik untuk langsung bertanya.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendMessage(suggestion)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm leading-snug text-slate-700 transition-colors hover:border-sage-400 hover:bg-sage-50 hover:text-sage-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#304636] dark:bg-[#1c3024] dark:text-[#d4e0d0] dark:hover:border-[#66864f] dark:hover:bg-[#263f2d] dark:hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
