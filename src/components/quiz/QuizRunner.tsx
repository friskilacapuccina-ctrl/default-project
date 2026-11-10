"use client";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/bits";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Clock3, Sprout, TrendingUp, XCircle } from "lucide-react";

type Opt = { id: string; optionText: string };
type Q = { id: string; questionText: string; options: Opt[] };
type ReviewItem = {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};
type QuizResult = { score: number; correctCount: number; wrongCount: number; review: ReviewItem[] };

export function QuizRunner({ kind }: { kind: "pretest" | "posttest" }) {
  const [qs, setQs] = useState<Q[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<string>();

  useEffect(() => {
    fetch(`/api/${kind}/questions`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) setLoadError(d.error ?? "Gagal memuat soal");
        else { setAssessmentId(d.assessmentId); setQs(d.questions); }
      })
      .catch(() => setLoadError("Gagal memuat soal"))
      .finally(() => setLoading(false));
  }, [kind]);

  if (loading) return <div className="card text-center text-sm text-slate-500 animate-pulse">Memuat soal...</div>;
  if (loadError) return <div className="card text-center text-sm text-red-600">{loadError}</div>;
  if (qs.length === 0) return <div className="card text-center text-sm text-slate-500">Belum ada soal.</div>;

  if (result) {
    return (
      <div className="space-y-6">
        <section className="card text-center">
          <h1 className="text-2xl font-bold text-slate-900">{kind === "pretest" ? "Pretest Selesai!" : "Posttest Selesai!"}</h1>
          <p className="text-5xl font-extrabold text-sage-700 mt-4">{result.score}<span className="text-lg text-slate-400">/100</span></p>
          <p className="text-sm text-slate-600 mt-2">Benar: {result.correctCount} • Salah: {result.wrongCount}</p>
          <p className="text-sm text-slate-500 mt-3">{kind === "pretest" ? "Pretest digunakan untuk mengetahui kemampuan awalmu. Silakan lanjutkan ke materi pembelajaran." : "Lihat perubahan skormu di halaman Progress."}</p>
          <div className="mt-5 flex justify-center gap-3">
            <a href={kind === "pretest" ? "/materi" : "/progress"} className="btn-primary text-sm">{kind === "pretest" ? "Lanjut ke Materi" : "Lihat Progress"}</a>
            <a href="/ai-tutor" className="btn-secondary text-sm">Tanya AI Tutor</a>
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="answer-review-heading">
          <div>
            <h2 id="answer-review-heading" className="text-xl font-bold text-slate-900">Tinjauan Jawaban</h2>
            <p className="mt-1 text-sm text-slate-600">Periksa jawabanmu dan pelajari pembahasan untuk soal yang masih keliru.</p>
          </div>
          {result.review.map((item, index) => (
            <article key={item.questionId} className={`card border-l-4 ${item.isCorrect ? "border-l-emerald-500" : "border-l-rose-500"}`}>
              <div className="flex items-start gap-3">
                {item.isCorrect
                  ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Soal {index + 1} · {item.isCorrect ? "Benar" : "Perlu dipelajari"}</p>
                  <h3 className="mt-1 font-semibold leading-relaxed text-slate-900">{item.questionText}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700"><span className="font-semibold">Jawabanmu:</span> {item.selectedAnswer}</p>
                  {!item.isCorrect && (
                    <>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-800"><span className="font-semibold">Jawaban benar:</span> {item.correctAnswer}</p>
                      <div className="mt-3 rounded-xl bg-sage-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                        <span className="font-semibold text-sage-900">Pembahasan: </span>
                        {item.explanation || "Pembahasan untuk soal ini belum tersedia."}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }

  if (!hasStarted) {
    const isPretest = kind === "pretest";
    const TestIcon = isPretest ? Sprout : TrendingUp;
    return (
      <section className="relative overflow-hidden rounded-3xl border border-sage-200 bg-gradient-to-br from-white via-sage-50 to-[#e5efda] shadow-sm dark:border-[#304636] dark:from-[#192b20] dark:via-[#1b3023] dark:to-[#203829]">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sage-300/20 blur-3xl dark:bg-sage-700/10" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-700 text-white shadow-lg shadow-sage-900/15 dark:bg-[#315d3d]">
              <TestIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sage-800 dark:bg-[#294532] dark:text-[#d3e4bf]">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {isPretest ? "Tes diagnostik" : "Evaluasi akhir"}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#edf4e2] md:text-2xl">
                {isPretest ? "Mulai dari yang sudah kamu pahami" : "Saatnya melihat hasil belajarmu"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-[#b6c5b1]">
                {isPretest
                  ? "Jawab berdasarkan pemahamanmu saat ini. Hasilnya menjadi titik awal untuk mengetahui materi yang bisa kamu dalami."
                  : "Gunakan pemahaman yang sudah kamu bangun selama belajar. Hasilnya dapat dibandingkan dengan kemampuan awalmu."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-sage-200/80 bg-white/75 p-4 dark:border-[#344c39] dark:bg-[#17271d]/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#c9dfa9]"><ClipboardCheck className="h-4 w-4" /></span>
              <div><p className="font-semibold text-slate-900 dark:text-[#e6eee1]">{qs.length} pertanyaan</p><p className="text-xs text-slate-500 dark:text-[#9eaf9a]">Pilihan ganda</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sage-200/80 bg-white/75 p-4 dark:border-[#344c39] dark:bg-[#17271d]/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#c9dfa9]"><Clock3 className="h-4 w-4" /></span>
              <div><p className="font-semibold text-slate-900 dark:text-[#e6eee1]">Tanpa batas waktu</p><p className="text-xs text-slate-500 dark:text-[#9eaf9a]">Kerjakan dengan tenang</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sage-200/80 bg-white/75 p-4 dark:border-[#344c39] dark:bg-[#17271d]/80">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-100 text-sage-800 dark:bg-[#294532] dark:text-[#c9dfa9]"><BookOpen className="h-4 w-4" /></span>
              <div><p className="font-semibold text-slate-900 dark:text-[#e6eee1]">Satu per satu</p><p className="text-xs text-slate-500 dark:text-[#9eaf9a]">Jawaban bisa ditinjau</p></div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-sage-200/80 pt-5 dark:border-[#344c39] sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#b6c5b1]"><CheckCircle2 className="h-4 w-4 shrink-0 text-sage-600 dark:text-[#a9cc7b]" /> Jawab semua pertanyaan untuk melihat hasil evaluasi.</p>
            <button
              type="button"
              onClick={() => { setStartedAt(new Date().toISOString()); setHasStarted(true); }}
              className="btn-primary group w-full justify-center sm:w-auto"
            >
              {isPretest ? "Mulai Pemetaan" : "Mulai Evaluasi"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const q = qs[idx];
  const done = Object.keys(answers).length;

  async function submit() {
    setSubmitting(true);
    setSubmitError("");
    const res = await fetch(`/api/${kind}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId, answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })), startedAt }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setSubmitError(data.error ?? "Gagal menyimpan"); return; }
    const reviewByQuestion = new Map<string, ReviewItem>((data.review as ReviewItem[]).map((item) => [item.questionId, item]));
    const orderedReview = qs
      .map((question) => reviewByQuestion.get(question.id))
      .filter((item): item is ReviewItem => item !== undefined);
    setResult({ ...data, review: orderedReview });
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-[#dce8d5]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-200 text-sage-900 dark:bg-[#294532] dark:text-[#d3e4bf]">{idx + 1}</span>
          Pertanyaan <span className="font-normal text-slate-500 dark:text-[#9eaf9a]">dari {qs.length}</span>
        </span>
        <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-800 dark:bg-[#1e3525] dark:text-[#c9dfa9]">{done} / {qs.length} terjawab</span>
      </div>
      <ProgressBar value={done} max={qs.length} />
      <div className="card relative mt-4 overflow-hidden border-sage-200/90 p-5 md:p-7">
        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-[#afca91]">
          <span className="h-1.5 w-1.5 rounded-full bg-sage-600 dark:bg-[#a9cc7b]" />
          Pilih satu jawaban
        </div>
        <p className="text-base font-semibold leading-relaxed text-slate-900 dark:text-[#edf4e2] md:text-lg">{q.questionText}</p>
        <div className="mt-5 space-y-3">
          {q.options.map((o, i) => {
            const label = ["A", "B", "C", "D"][i];
            const active = answers[q.id] === o.id;
            return (
              <button key={o.id} type="button" aria-pressed={active} onClick={() => setAnswers({ ...answers, [q.id]: o.id })}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm leading-relaxed transition-colors ${active ? "border-sage-500 bg-sage-50 font-medium text-sage-950 ring-2 ring-sage-500/15 dark:border-[#8ba86d] dark:bg-[#294532] dark:text-[#f0f5e8]" : "border-slate-200 bg-white/50 text-slate-700 hover:border-sage-300 hover:bg-sage-50/70 dark:border-[#304636] dark:bg-[#192b20]/70 dark:text-[#d1ddcd] dark:hover:border-[#6e8c56] dark:hover:bg-[#203729]"}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${active ? "bg-sage-700 text-white dark:bg-[#456b44]" : "bg-slate-100 text-slate-600 dark:bg-[#2a3b2e] dark:text-[#c1cebd]"}`}>{label}</span>
                <span className="pt-0.5">{o.optionText}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-3">
        <button className="btn-secondary text-sm dark:border-[#36513b] dark:bg-[#203328] dark:text-[#dce8d3] dark:hover:bg-[#2a4532]" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ArrowLeft className="h-4 w-4" /> Sebelumnya</button>
        {idx < qs.length - 1 ? (
          <button className="btn-primary text-sm" onClick={() => setIdx(idx + 1)}>Berikutnya <ArrowRight className="h-4 w-4" /></button>
        ) : (
          <button className="btn-primary text-sm" disabled={submitting || done < qs.length} onClick={submit} title={done < qs.length ? `Jawab semua soal dulu (${done}/${qs.length})` : ""}>
            {submitting ? "Menyimpan..." : `Submit ${kind === "pretest" ? "Pretest" : "Posttest"}`}
          </button>
        )}
      </div>
      {submitError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-3">{submitError}</p>}
    </div>
  );
}
