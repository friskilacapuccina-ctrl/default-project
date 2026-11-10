"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type AssessmentKind = "PRETEST" | "POSTTEST";
type AssessmentOption = { id: string; text: string; isCorrect: boolean };
type AssessmentQuestion = { id: string; questionText: string; explanation: string; options: AssessmentOption[] };
export type AssessmentData = { id: string; kind: AssessmentKind; title: string; description: string; questions: AssessmentQuestion[] };
type QuestionDraft = { questionText: string; explanation: string; options: string[]; correctIndex: number };

const emptyQuestion = (): QuestionDraft => ({ questionText: "", explanation: "", options: ["", "", "", ""], correctIndex: 0 });
const optionLabel = ["A", "B", "C", "D"];

export function AssessmentManager({ initialAssessments }: { initialAssessments: AssessmentData[] }) {
  const router = useRouter();
  const [assessments, setAssessments] = useState(initialAssessments);
  const [kind, setKind] = useState<AssessmentKind>("PRETEST");
  const assessment = assessments.find((item) => item.kind === kind)!;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<QuestionDraft>(emptyQuestion);
  const [dirtyKinds, setDirtyKinds] = useState<Record<AssessmentKind, boolean>>({ PRETEST: false, POSTTEST: false });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dirty = dirtyKinds[kind];
  const questions = assessment.questions;

  function updateAssessment(update: (current: AssessmentData) => AssessmentData) {
    setAssessments((current) => current.map((item) => item.kind === kind ? update(item) : item));
    setDirtyKinds((current) => ({ ...current, [kind]: true }));
    setMessage("");
  }

  function beginAdd() {
    setEditingId(null);
    setDraft(emptyQuestion());
    setAdding(true);
    setError("");
  }

  function beginEdit(question: AssessmentQuestion) {
    setEditingId(question.id);
    setDraft({ questionText: question.questionText, explanation: question.explanation, options: question.options.map((option) => option.text), correctIndex: Math.max(0, question.options.findIndex((option) => option.isCorrect)) });
    setAdding(false);
    setError("");
  }

  function closeEditor() {
    setEditingId(null);
    setAdding(false);
    setDraft(emptyQuestion());
    setError("");
  }

  function saveQuestion() {
    if (draft.questionText.trim().length < 10) { setError("Tulis soal dengan jelas, minimal 10 karakter."); return; }
    if (draft.options.some((option) => !option.trim())) { setError("Lengkapi semua empat pilihan jawaban."); return; }

    const question: AssessmentQuestion = {
      id: editingId ?? `draft-${Date.now()}`,
      questionText: draft.questionText.trim(),
      explanation: draft.explanation.trim(),
      options: draft.options.map((text, index) => ({ id: `${editingId ?? "draft"}-${index}`, text: text.trim(), isCorrect: index === draft.correctIndex })),
    };
    updateAssessment((current) => ({ ...current, questions: editingId ? current.questions.map((item) => item.id === editingId ? question : item) : [...current.questions, question] }));
    closeEditor();
  }

  function deleteQuestion(question: AssessmentQuestion) {
    if (!window.confirm("Hapus soal ini dari versi tes berikutnya? Versi dan hasil tes siswa sebelumnya tetap tersimpan.")) return;
    updateAssessment((current) => ({ ...current, questions: current.questions.filter((item) => item.id !== question.id) }));
    if (editingId === question.id) closeEditor();
  }

  async function saveAssessment() {
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/teacher/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: assessment.title,
          description: assessment.description,
          questions: assessment.questions.map((question) => ({ questionText: question.questionText, explanation: question.explanation, options: question.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })) })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Perubahan tes belum berhasil disimpan."); return; }
      setAssessments((current) => current.map((item) => item.kind === kind ? { ...item, id: result.id } : item));
      setDirtyKinds((current) => ({ ...current, [kind]: false }));
      setMessage(`${assessment.title} berhasil disimpan sebagai versi baru. Hasil siswa sebelumnya tetap utuh.`);
      router.refresh();
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function archiveAssessment() {
    const testName = kind === "PRETEST" ? "Pretest" : "Posttest";
    if (!assessment.id || !window.confirm(`Hapus ${testName} aktif dari siswa? Nilai serta jawaban tes yang sudah dikerjakan tetap disimpan.`)) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/teacher/assessments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.error ?? "Tes belum berhasil dihapus."); return; }
      setAssessments((current) => current.map((item) => item.kind === kind ? { ...item, id: "", questions: [] } : item));
      setDirtyKinds((current) => ({ ...current, [kind]: true }));
      setMessage(`${testName} dihapus dari siswa. Hasil lama tetap tersimpan; tambahkan soal dan simpan untuk menerbitkan versi baru.`);
      router.refresh();
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }

  function switchKind(next: AssessmentKind) {
    if ((adding || editingId) && !window.confirm("Tutup editor soal? Perubahan pada soal yang belum disimpan akan hilang.")) return;
    setKind(next);
    setEditingId(null);
    setAdding(false);
    setDraft(emptyQuestion());
    setMessage("");
    setError("");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pilih tes yang dikelola">
        {(["PRETEST", "POSTTEST"] as const).map((item) => {
          const current = assessments.find((entry) => entry.kind === item)!;
          const active = kind === item;
          return <button key={item} type="button" role="tab" aria-selected={active} onClick={() => switchKind(item)} className={active ? "btn-primary" : "btn-secondary"}>
            <ClipboardCheck className="h-4 w-4" />{item === "PRETEST" ? "Pretest" : "Posttest"}<span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{current.questions.length} soal</span>
          </button>;
        })}
      </div>

      <section className="card space-y-5" aria-label={`Pengelolaan ${kind.toLowerCase()}`}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">Nama tes
            <input className="input" value={assessment.title} maxLength={160} onChange={(event) => updateAssessment((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700">Keterangan singkat
            <input className="input" value={assessment.description} maxLength={1000} onChange={(event) => updateAssessment((current) => ({ ...current, description: event.target.value }))} />
          </label>
        </div>

        <div className="flex flex-col justify-between gap-3 border-y border-slate-100 py-4 sm:flex-row sm:items-center dark:border-[#304636]">
          <div><h2 className="font-semibold text-slate-900">Daftar soal</h2><p className="text-sm text-slate-500">{questions.length} soal · empat pilihan · satu jawaban benar</p></div>
          <button type="button" className="btn-secondary inline-flex items-center justify-center gap-2" onClick={beginAdd}><Plus className="h-4 w-4" />Tambah soal</button>
        </div>

        {(adding || editingId) && (
          <section className="rounded-2xl border border-sage-300 bg-sage-50/70 p-4 dark:border-[#4b6947] dark:bg-[#203328]" aria-label={editingId ? "Edit soal" : "Tambah soal baru"}>
            <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{editingId ? "Edit soal" : "Soal baru"}</h3><p className="text-sm text-slate-600">Pilih jawaban benar menggunakan tombol bulat.</p></div><button type="button" onClick={closeEditor} className="btn-ghost btn-sm" aria-label="Tutup editor"><X className="h-4 w-4" /></button></div>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">Pertanyaan
              <textarea className="input min-h-28" value={draft.questionText} onChange={(event) => setDraft((current) => ({ ...current, questionText: event.target.value }))} placeholder="Tulis soal dengan konteks dan pertanyaan yang jelas." />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {draft.options.map((option, index) => <label key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-[#405747] dark:bg-[#192b20]">
                <input type="radio" name="correct-option" checked={draft.correctIndex === index} onChange={() => setDraft((current) => ({ ...current, correctIndex: index }))} aria-label={`Tandai pilihan ${optionLabel[index]} sebagai jawaban benar`} className="h-4 w-4 accent-[#498428]" />
                <span className="w-6 shrink-0 text-sm font-semibold text-sage-800">{optionLabel[index]}.</span>
                <input className="min-w-0 flex-1 border-0 bg-transparent p-1 text-sm text-slate-800 outline-none focus:ring-0 dark:text-[#e2eadc]" value={option} onChange={(event) => setDraft((current) => ({ ...current, options: current.options.map((value, optionIndex) => optionIndex === index ? event.target.value : value) }))} placeholder={`Pilihan ${optionLabel[index]}`} aria-label={`Teks pilihan ${optionLabel[index]}`} />
              </label>)}
            </div>
            <label className="mt-4 block space-y-1.5 text-sm font-medium text-slate-700">Pembahasan jawaban <span className="font-normal text-slate-500">(opsional)</span>
              <textarea className="input min-h-20" value={draft.explanation} onChange={(event) => setDraft((current) => ({ ...current, explanation: event.target.value }))} placeholder="Tuliskan alasan jawaban benar." />
            </label>
            {error && <p className="mt-3 text-sm text-red-700 dark:text-[#f0b8ad]" role="alert">{error}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" className="btn-secondary" onClick={closeEditor}>Batal</button><button type="button" className="btn-primary" onClick={saveQuestion}><Check className="h-4 w-4" />Simpan soal</button></div>
          </section>
        )}

        <div className="space-y-3">
          {questions.length === 0 ? <p className="rounded-xl border border-dashed border-sage-300 px-4 py-8 text-center text-sm text-slate-600 dark:border-[#405747] dark:text-[#b8c7b3]">Belum ada soal. Tambahkan soal pertama untuk mengaktifkan tes.</p> : questions.map((question, index) => (
            <article key={question.id} className="rounded-2xl border border-slate-200 p-4 dark:border-[#304636]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-sage-700">Soal {index + 1}</p><p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-900">{question.questionText}</p></div>
                <div className="flex shrink-0 gap-2"><button type="button" className="btn-secondary btn-sm" onClick={() => beginEdit(question)}><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" className="btn-secondary btn-sm border-red-200 text-red-700 hover:bg-red-50 dark:border-[#624139] dark:text-[#f0b8ad] dark:hover:bg-[#3a2824]" onClick={() => deleteQuestion(question)}><Trash2 className="h-3.5 w-3.5" />Hapus</button></div>
              </div>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <li key={option.id} className={`rounded-xl px-3 py-2 text-sm ${option.isCorrect ? "bg-sage-100 font-medium text-sage-900 dark:bg-[#294532] dark:text-[#dce9c9]" : "bg-slate-50 text-slate-700 dark:bg-[#203328] dark:text-[#c1cebd]"}`}><span className="mr-1 font-semibold">{optionLabel[optionIndex]}.</span>{option.text}{option.isCorrect && <span className="ml-2 text-xs font-bold">· Kunci</span>}</li>)}</ol>
              {question.explanation && <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600 dark:border-[#304636] dark:text-[#b8c7b3]"><span className="font-semibold">Pembahasan:</span> {question.explanation}</p>}
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-sage-50 px-4 py-3 text-sm text-slate-700 dark:bg-[#203328] dark:text-[#d7e3d1] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">Simpan membuat versi tes baru. Nilai dan jawaban siswa dari versi lama tetap tersimpan dan tidak dihitung ulang.</p>
          <div className="flex flex-wrap gap-2">
            {assessment.id && <button type="button" className="btn-secondary inline-flex items-center justify-center gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-[#624139] dark:text-[#f0b8ad] dark:hover:bg-[#3a2824]" onClick={archiveAssessment} disabled={pending}><Trash2 className="h-4 w-4" />Hapus tes</button>}
            <button type="button" className="btn-primary inline-flex shrink-0 items-center justify-center gap-2" onClick={saveAssessment} disabled={!dirty || pending || questions.length === 0 || assessment.title.trim().length < 3}><Save className="h-4 w-4" />{pending ? "Menyimpan..." : dirty ? "Simpan perubahan" : "Tersimpan"}</button>
          </div>
        </div>
        {message && <p className="text-sm text-emerald-700 dark:text-[#b8d596]" role="status">{message}</p>}
        {error && !adding && !editingId && <p className="text-sm text-red-700 dark:text-[#f0b8ad]" role="alert">{error}</p>}
      </section>
    </div>
  );
}
