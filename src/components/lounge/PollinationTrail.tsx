"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Flower2,
  Heart,
  Leaf,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

type Point = { x: number; y: number };
type Stage = {
  name: string;
  description: string;
  paths: string[];
  flowers: Point[];
  thorns: Point[];
  exit: Point;
  energy: number;
  efficientMoves: number;
};

const pointKey = ({ x, y }: Point) => `${x},${y}`;
const nest = { x: 1, y: 5 };

const basePaths = [
  "1,5", "1,4", "1,3", "2,3", "3,3", "3,2", "4,2", "5,2", "5,3", "5,4",
  "4,4", "3,4", "3,5", "3,6", "4,6", "5,6", "5,5", "6,5", "2,2", "2,1", "3,1",
];
const pathExpansions = [
  ["4,1", "5,1", "6,1", "6,2", "6,3", "6,4"],
  ["4,5", "2,5", "2,6"],
  ["1,2", "1,1"],
  ["2,4", "1,6"],
];
const gardenPlans = [
  { name: "Taman Pagi", description: "Kenali jalur kebun. Singgahi tiga bunga dan pulang ke sarang.", flowers: ["4,2", "4,4", "4,6"], thorns: ["2,1"], energy: 32, efficientMoves: 22, paths: 0 },
  { name: "Kebun Berliku", description: "Cabang jalan mulai terbuka. Rencanakan rute agar tidak bolak-balik.", flowers: ["4,2", "6,2", "4,6"], thorns: ["2,1", "6,3"], energy: 36, efficientMoves: 25, paths: 1 },
  { name: "Kebun Warna", description: "Empat bunga tersebar di dua sisi kebun. Pilih urutan kunjungan yang hemat energi.", flowers: ["4,2", "6,2", "4,4", "2,6"], thorns: ["2,1", "6,3", "2,5"], energy: 40, efficientMoves: 28, paths: 2 },
  { name: "Taman Kupu-kupu", description: "Jalur utara terbuka, tetapi ada duri di persimpangan. Lihat peta sebelum bergerak.", flowers: ["4,2", "6,2", "4,4", "3,1"], thorns: ["2,1", "6,3", "2,5", "5,3"], energy: 43, efficientMoves: 30, paths: 3 },
  { name: "Ladang Bunga", description: "Lima bunga harus disinggahi. Hindari jalan buntu agar energi cukup untuk pulang.", flowers: ["4,2", "6,2", "4,4", "2,6", "5,1"], thorns: ["2,1", "6,3", "2,5", "5,3"], energy: 47, efficientMoves: 33, paths: 4 },
  { name: "Kebun Bertingkat", description: "Enam bunga dan lebih banyak duri. Susun rute dari cabang terjauh menuju sarang.", flowers: ["4,2", "6,2", "4,4", "2,6", "5,1", "6,4"], thorns: ["2,1", "6,3", "2,5", "5,3", "4,5"], energy: 51, efficientMoves: 36, paths: 4 },
  { name: "Lembah Serbuk Sari", description: "Tujuh bunga berjauhan. Setiap langkah perlu diperhitungkan karena duri makin rapat.", flowers: ["4,2", "6,2", "4,4", "2,6", "5,1", "6,4", "1,2"], thorns: ["2,1", "6,3", "2,5", "5,3", "4,5", "3,1"], energy: 56, efficientMoves: 39, paths: 4 },
  { name: "Hutan Mini", description: "Delapan bunga memenuhi hampir seluruh kebun. Pilih cabang dan rute pulang dengan cermat.", flowers: ["4,2", "6,2", "4,4", "2,6", "5,1", "6,4", "1,2", "2,5"], thorns: ["2,1", "6,3", "5,3", "4,5", "3,1", "1,1"], energy: 61, efficientMoves: 42, paths: 4 },
  { name: "Taman Berbatu", description: "Sembilan bunga, percabangan sempit, dan banyak duri. Prioritaskan rute tanpa mengulang jalan.", flowers: ["4,2", "6,2", "4,4", "2,6", "5,1", "6,4", "1,2", "2,5", "2,4"], thorns: ["2,1", "6,3", "5,3", "4,5", "3,1", "1,1", "1,6"], energy: 67, efficientMoves: 45, paths: 4 },
  { name: "Kebun Pelangi", description: "Tantangan puncak: sepuluh bunga tersebar di seluruh kebun. Rencanakan urutan dan sisakan energi untuk pulang.", flowers: ["4,2", "6,2", "4,4", "2,6", "5,1", "6,4", "1,2", "2,5", "2,4", "1,1"], thorns: ["2,1", "6,3", "5,3", "4,5", "3,1", "1,6", "4,1"], energy: 73, efficientMoves: 48, paths: 4 },
];
const stages: Stage[] = gardenPlans.map((plan) => ({
  name: plan.name,
  description: plan.description,
  paths: [...basePaths, ...pathExpansions.slice(0, plan.paths).flat()],
  flowers: plan.flowers.map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  }),
  thorns: plan.thorns.map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  }),
  exit: { x: 6, y: 5 },
  energy: plan.energy,
  efficientMoves: plan.efficientMoves,
}));

const moves = [
  { dx: 0, dy: -1, label: "Atas", Icon: ArrowUp },
  { dx: -1, dy: 0, label: "Kiri", Icon: ArrowLeft },
  { dx: 0, dy: 1, label: "Bawah", Icon: ArrowDown },
  { dx: 1, dy: 0, label: "Kanan", Icon: ArrowRight },
];

type Props = { totalXp: number; onBack: () => void; onEarned: (xp: number) => void };

export function PollinationTrail({ totalXp, onBack, onEarned }: Props) {
  const [screen, setScreen] = useState<"intro" | "playing" | "stage-clear" | "finished" | "game-over">("intro");
  const [stageIndex, setStageIndex] = useState(0);
  const [bee, setBee] = useState<Point>(nest);
  const [collected, setCollected] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);
  const [energy, setEnergy] = useState(stages[0].energy);
  const [steps, setSteps] = useState(0);
  const [runXp, setRunXp] = useState(0);
  const stage = stages[stageIndex];
  const flowerKeys = stage.flowers.map(pointKey);
  const complete = flowerKeys.every((key) => collected.includes(key));

  function startGame(index = 0) {
    setStageIndex(index);
    setBee(nest);
    setCollected([]);
    setHearts(3);
    setEnergy(stages[index].energy);
    setSteps(0);
    setRunXp(0);
    setScreen("playing");
  }

  function moveBee(dx: number, dy: number) {
    if (screen !== "playing") return;
    const next = { x: bee.x + dx, y: bee.y + dy };
    const nextKey = pointKey(next);
    if (!stage.paths.includes(nextKey)) return;
    if (stage.thorns.some((thorn) => pointKey(thorn) === nextKey)) {
      const remaining = hearts - 1;
      const remainingEnergy = Math.max(0, energy - 3);
      setHearts(remaining);
      setEnergy(remainingEnergy);
      setSteps((current) => current + 1);
      setBee(nest);
      if (remaining <= 0 || remainingEnergy <= 0) setScreen("game-over");
      return;
    }

    const remainingEnergy = energy - 1;
    setBee(next);
    setEnergy(remainingEnergy);
    setSteps((current) => current + 1);
    if (flowerKeys.includes(nextKey) && !collected.includes(nextKey)) {
      setCollected((current) => [...current, nextKey]);
    }
    if (nextKey === pointKey(stage.exit) && complete) {
      const nextSteps = steps + 1;
      const efficiencyBonus = nextSteps <= stage.efficientMoves ? 35 : 0;
      const reward = 60 + hearts * 10 + efficiencyBonus;
      setRunXp((current) => current + reward);
      onEarned(reward);
      setScreen(stageIndex === stages.length - 1 ? "finished" : "stage-clear");
    } else if (remainingEnergy <= 0) {
      setScreen("game-over");
    }
  }

  useEffect(() => {
    if (screen !== "playing") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const move = moves.find(({ dx, dy }) =>
        (event.key === "ArrowUp" && dy === -1) ||
        (event.key === "ArrowDown" && dy === 1) ||
        (event.key === "ArrowLeft" && dx === -1) ||
        (event.key === "ArrowRight" && dx === 1)
      );
      if (!move) return;
      event.preventDefault();
      moveBee(move.dx, move.dy);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 animate-in fade-in duration-300">
      <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-sage-800 transition hover:bg-sage-100 dark:text-[#dce9c9] dark:hover:bg-[#263d2d]">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Santai
      </button>

      <section className="overflow-hidden rounded-3xl border border-sage-200 bg-white/90 shadow-sm dark:border-[#304636] dark:bg-[#192b20]">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#315f3d] to-[#4e7d43] px-5 py-5 text-white dark:from-[#203e2b] dark:to-[#294d33] md:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Flower2 className="h-6 w-6" /></span>
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#dce9ae]">Permainan penyerbukan</p><h1 className="text-xl font-black md:text-2xl">Jejak Si Lebah</h1></div>
          </div>
          <p className="rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-sm font-semibold"><Zap className="mr-1 inline h-4 w-4 text-[#e4edaa]" />{totalXp} XP terkumpul</p>
        </header>

        {screen === "intro" ? (
          <div className="relative isolate mx-auto max-w-3xl overflow-hidden p-6 text-center md:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-[#6d9856] dark:text-[#a2bc83]">
              <svg className="absolute -left-6 top-2 h-56 w-56 opacity-[0.12] blur-[0.2px] md:h-64 md:w-64" viewBox="0 0 220 220" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M108 197c2-40 1-68 1-106" strokeLinecap="round" />
                <path d="M108 147c-28-29-49-17-52 5 25 16 42 12 52-5Zm2-26c24-31 48-24 53-2-22 19-42 16-53 2Z" fill="currentColor" fillOpacity=".16" />
                <circle cx="109" cy="67" r="17" fill="currentColor" fillOpacity=".2" />
                <ellipse cx="109" cy="39" rx="12" ry="19" /><ellipse cx="135" cy="57" rx="12" ry="19" transform="rotate(60 135 57)" /><ellipse cx="125" cy="87" rx="12" ry="19" transform="rotate(120 125 87)" /><ellipse cx="93" cy="87" rx="12" ry="19" transform="rotate(60 93 87)" /><ellipse cx="83" cy="57" rx="12" ry="19" transform="rotate(120 83 57)" />
              </svg>
              <svg className="absolute -bottom-8 -right-5 h-52 w-64 rotate-[-12deg] opacity-[0.11] blur-[0.2px] md:h-60 md:w-72" viewBox="0 0 260 190" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M49 102c24-29 54-40 90-35 31 4 57 19 73 43-19 22-49 36-81 34-35-1-62-15-82-42Z" fill="currentColor" fillOpacity=".18" />
                <path d="M68 104c34 7 75 5 119-6M105 71c-8-24 7-37 26-31 16 5 20 23 8 37M129 68c10-28 34-31 43-16 8 14-2 30-22 38" />
                <path d="M106 92c-12 19-10 39 4 46m33-48c18 13 24 29 17 45m-69-33-18 21m87-29 24 16" />
                <path d="m138 76 11 5-10 6-11-6 10-5Z" fill="currentColor" />
              </svg>
              <span className="absolute right-[28%] top-7 text-6xl opacity-[0.08]">✿</span>
            </div>
            <div className="relative z-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f2d9]/90 text-4xl shadow-sm dark:bg-[#294332]/90">🐝</span>
              <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">Bantu bunga bertemu serbuk sari</h2>
              <p className="mx-auto mt-2 max-w-xl leading-relaxed text-slate-600 dark:text-[#b9c7b4]">Jelajahi sepuluh kebun yang makin menantang. Kumpulkan serbuk sari di setiap bunga, hindari duri, dan sisakan energi untuk kembali ke sarang.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#c7d3c1]">
                <span className="rounded-full bg-[#f0f4e9]/90 px-3 py-2 dark:bg-[#22362a]/90">10 kebun bertahap</span><span className="rounded-full bg-[#f0f4e9]/90 px-3 py-2 dark:bg-[#22362a]/90">3 nyawa per kebun</span><span className="rounded-full bg-[#f0f4e9]/90 px-3 py-2 dark:bg-[#22362a]/90">Energi langkah terbatas</span><span className="rounded-full bg-[#f0f4e9]/90 px-3 py-2 dark:bg-[#22362a]/90">Panah keyboard atau tombol layar</span>
              </div>
              <button type="button" onClick={() => startGame()} className="btn-primary mt-7 inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Mulai bermain</button>
            </div>
          </div>
        ) : screen === "playing" ? (
          <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_230px] md:p-7">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-[#b8d596]">Kebun {stageIndex + 1} dari {stages.length}</p><h2 className="text-xl font-black text-slate-900 dark:text-[#edf4e2]">{stage.name}</h2><p className="text-sm text-slate-600 dark:text-[#b9c7b4]">{stage.description}</p></div>
                <div className="flex gap-1" aria-label={`${hearts} nyawa tersisa`}>{Array.from({ length: 3 }, (_, index) => <Heart key={index} className={`h-5 w-5 ${index < hearts ? "fill-rose-400 text-rose-500" : "text-slate-300 dark:text-slate-600"}`} />)}</div>
              </div>
              <div className="mx-auto grid w-full max-w-[430px] grid-cols-7 gap-1.5 rounded-2xl border border-[#d7e5c7] bg-[#edf4e5] p-2 dark:border-[#3a5940] dark:bg-[#203629] sm:gap-2 sm:p-3">
                {Array.from({ length: 49 }, (_, index) => {
                  const point = { x: index % 7, y: Math.floor(index / 7) };
                  const key = pointKey(point);
                  const path = stage.paths.includes(key);
                  const isBee = pointKey(bee) === key;
                  const isFlower = flowerKeys.includes(key);
                  const isExit = pointKey(stage.exit) === key;
                  const isThorn = stage.thorns.some((thorn) => pointKey(thorn) === key);
                  return <div key={key} className={`flex aspect-square items-center justify-center rounded-lg text-lg sm:rounded-xl sm:text-2xl ${path ? "bg-[#dce9c7] shadow-inner dark:bg-[#304938]" : "bg-[#e5ecde]/60 dark:bg-[#192a20]"}`}>
                    {isBee ? <span aria-label="Lebah">🐝</span> : isExit ? <span aria-label="Sarang">🪹</span> : isThorn ? <span aria-label="Duri">🌵</span> : isFlower ? <span className={collected.includes(key) ? "opacity-40 grayscale" : ""} aria-label={collected.includes(key) ? "Bunga telah disinggahi" : "Bunga"}>{collected.includes(key) ? "🌼" : "🌸"}</span> : path ? <Leaf className="h-3 w-3 text-[#8ca974]/60 sm:h-4 sm:w-4" /> : null}
                  </div>;
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600 dark:text-[#c7d3c1]">
                <span className="rounded-full bg-[#f0f4e9] px-3 py-1.5 dark:bg-[#22362a]">Energi {energy}/{stage.energy}</span>
                <span className="rounded-full bg-[#f0f4e9] px-3 py-1.5 dark:bg-[#22362a]">Langkah {steps}</span>
                <span className="rounded-full bg-[#f0f4e9] px-3 py-1.5 dark:bg-[#22362a]">Bonus 35 XP jika ≤ {stage.efficientMoves} langkah</span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2" aria-label="Kontrol gerak">
                <div className="grid grid-cols-3 gap-1.5">
                  <span />{moves.filter((move) => move.label === "Atas").map(({ dx, dy, Icon, label }) => <button key={label} type="button" onClick={() => moveBee(dx, dy)} aria-label={label} className="flex h-11 w-12 items-center justify-center rounded-xl border border-sage-200 bg-white text-sage-800 shadow-sm hover:bg-sage-50 dark:border-[#405a46] dark:bg-[#263d2d] dark:text-[#e2edda]"><Icon className="h-5 w-5" /></button>)}<span />
                  {moves.filter((move) => move.label !== "Atas").map(({ dx, dy, Icon, label }) => <button key={label} type="button" onClick={() => moveBee(dx, dy)} aria-label={label} className="flex h-11 w-12 items-center justify-center rounded-xl border border-sage-200 bg-white text-sage-800 shadow-sm hover:bg-sage-50 dark:border-[#405a46] dark:bg-[#263d2d] dark:text-[#e2edda]"><Icon className="h-5 w-5" /></button>)}
                </div>
              </div>
            </div>
            <aside className="space-y-3">
              <div className="rounded-2xl border border-sage-200 bg-[#f5f8f0] p-4 dark:border-[#405a46] dark:bg-[#263d2d]"><p className="text-sm font-bold text-slate-800 dark:text-[#edf4e2]">Serbuk sari</p><p className="mt-1 text-2xl font-black text-sage-800 dark:text-[#dce9ae]">{collected.length}<span className="text-base font-semibold text-slate-500 dark:text-[#aab9a7]"> / {stage.flowers.length}</span></p><div className="mt-3 flex gap-1.5">{stage.flowers.map((flower) => <span key={pointKey(flower)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${collected.includes(pointKey(flower)) ? "bg-[#dce9ae]" : "bg-white dark:bg-[#1d3024]"}`}>{collected.includes(pointKey(flower)) ? "🌼" : "🌸"}</span>)}</div></div>
              <div className="rounded-2xl border border-[#d7e5c7] bg-white p-4 dark:border-[#405a46] dark:bg-[#263d2d]"><p className="text-sm font-bold text-slate-800 dark:text-[#edf4e2]">Cara bermain</p><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#b9c7b4]">Gerakkan lebah di jalur daun. Kunjungi semua bunga, kemudian menuju sarang. Rute cukup lapang untuk eksplorasi, tetapi duri mengurangi nyawa dan energi.</p><p className="mt-3 rounded-xl bg-[#edf4e5] p-3 text-xs leading-relaxed text-slate-600 dark:bg-[#1d3024] dark:text-[#c7d3c1]">Penyerbukan membantu tumbuhan membentuk biji dan buah. Rute yang lebih efisien memberi bonus XP.</p></div>
            </aside>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl p-7 text-center md:p-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f2d9] text-sage-700 dark:bg-[#294332] dark:text-[#dce9ae]">{screen === "game-over" ? <Heart className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}</span>
            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">{screen === "game-over" ? "Lebah perlu istirahat" : screen === "finished" ? "Semua kebun terserbuki!" : `${stage.name} berhasil!`}</h2>
            <p className="mt-2 text-slate-600 dark:text-[#b9c7b4]">{screen === "game-over" ? "Coba lagi dan atur langkahmu. Progres kebun ini akan dimulai ulang." : `XP yang baru didapat dari kebun ini: ${60 + (hearts * 10)}${steps <= stage.efficientMoves ? " + 35 bonus rute efisien" : ""}. Total hadiah sesi: ${runXp} XP.`}</p>
            {screen === "stage-clear" ? <button type="button" onClick={() => { const nextStage = stageIndex + 1; setStageIndex(nextStage); setBee(nest); setCollected([]); setHearts(3); setEnergy(stages[nextStage].energy); setSteps(0); setScreen("playing"); }} className="btn-primary mt-6 inline-flex items-center gap-2">Lanjut ke kebun berikutnya <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => startGame(screen === "game-over" ? stageIndex : 0)} className="btn-primary mt-6 inline-flex items-center gap-2"><RotateCcw className="h-4 w-4" /> {screen === "game-over" ? "Coba kebun ini lagi" : "Main lagi"}</button>}
          </div>
        )}
      </section>
    </div>
  );
}
