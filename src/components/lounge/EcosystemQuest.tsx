"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Flame,
  Heart,
  Leaf,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { MemoryMatch } from "./MemoryMatch";
import { PollinationTrail } from "./PollinationTrail";
import { BioRush } from "./BioRush";

type Organism = { id: string; name: string; emoji: string; role: string };
type Level = {
  habitat: string;
  emoji: string;
  title: string;
  description: string;
  chain: string[];
  deck: Organism[];
};

const levels: Level[] = [
  {
    habitat: "Sawah",
    emoji: "🌾",
    title: "Selamatkan Sawah",
    description:
      "Rantai makanan di sawah terputus. Susun kembali agar energi bisa mengalir dan semua penghuninya bertahan!",
    chain: ["padi", "belalang", "katak", "ular", "jamur"],
    deck: [
      { id: "padi", name: "Padi", emoji: "🌾", role: "Produsen" },
      { id: "belalang", name: "Belalang", emoji: "🦗", role: "Konsumen I" },
      { id: "katak", name: "Katak", emoji: "🐸", role: "Konsumen II" },
      { id: "ular", name: "Ular sawah", emoji: "🐍", role: "Konsumen III" },
      { id: "jamur", name: "Jamur", emoji: "🍄", role: "Pengurai" },
      { id: "elang", name: "Elang", emoji: "🦅", role: "Predator" },
      { id: "kupu", name: "Kupu-kupu", emoji: "🦋", role: "Penyerbuk" },
      { id: "batu", name: "Batu", emoji: "🪨", role: "Benda abiotik" },
    ],
  },
  {
    habitat: "Kolam",
    emoji: "🪷",
    title: "Pulihkan Kolam",
    description:
      "Kolam kehilangan keseimbangannya. Hubungkan organisme yang tepat supaya aliran energi kembali lancar.",
    chain: [
      "fitoplankton",
      "zooplankton",
      "ikan-kecil",
      "ikan-besar",
      "bakteri",
    ],
    deck: [
      {
        id: "fitoplankton",
        name: "Fitoplankton",
        emoji: "🦠",
        role: "Produsen",
      },
      {
        id: "zooplankton",
        name: "Zooplankton",
        emoji: "🦐",
        role: "Konsumen I",
      },
      {
        id: "ikan-kecil",
        name: "Ikan kecil",
        emoji: "🐟",
        role: "Konsumen II",
      },
      {
        id: "ikan-besar",
        name: "Ikan besar",
        emoji: "🐠",
        role: "Konsumen III",
      },
      { id: "bakteri", name: "Bakteri", emoji: "🧫", role: "Pengurai" },
      { id: "teratai", name: "Teratai", emoji: "🪷", role: "Tumbuhan air" },
      {
        id: "katak-kolam",
        name: "Katak",
        emoji: "🐸",
        role: "Pemangsa serangga",
      },
      { id: "pasir", name: "Pasir", emoji: "🏖️", role: "Benda abiotik" },
    ],
  },
  {
    habitat: "Hutan",
    emoji: "🌳",
    title: "Jaga Hutan Hujan",
    description:
      "Bantu penghuni hutan menemukan kembali jalur makanannya sebelum energi ekosistem habis.",
    chain: ["daun", "ulat", "burung", "elang-hutan", "jamur-hutan"],
    deck: [
      { id: "daun", name: "Daun", emoji: "🍃", role: "Produsen" },
      { id: "ulat", name: "Ulat", emoji: "🐛", role: "Konsumen I" },
      { id: "burung", name: "Burung kecil", emoji: "🐦", role: "Konsumen II" },
      { id: "elang-hutan", name: "Elang", emoji: "🦅", role: "Konsumen III" },
      { id: "jamur-hutan", name: "Jamur", emoji: "🍄", role: "Pengurai" },
      { id: "rusa", name: "Rusa", emoji: "🦌", role: "Herbivor" },
      { id: "lebah", name: "Lebah", emoji: "🐝", role: "Penyerbuk" },
      { id: "awan", name: "Awan", emoji: "☁️", role: "Benda abiotik" },
    ],
  },
];

const GAME_UNLOCKS = {
  bioRush: 180,
  memory: 420,
  ecosystem: 800,
};

const roles = [
  "Produsen",
  "Konsumen I",
  "Konsumen II",
  "Konsumen III",
  "Pengurai",
];

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function EcosystemQuest() {
  const [screen, setScreen] = useState<
    "lobby" | "mission-intro" | "playing" | "level-clear" | "finished" | "game-over"
  >("lobby");
  const [levelIndex, setLevelIndex] = useState(0);
  const [cards, setCards] = useState<Organism[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>(Array(5).fill(null));
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [feedback, setFeedback] = useState<"wrong" | null>(null);
  const [activeGame, setActiveGame] = useState<"memory" | "pollination" | "bio-rush" | null>(
    null
  );

  useEffect(() => {
    try {
      setTotalXp(Number(localStorage.getItem("biolearn-lounge-xp") ?? 0));
    } catch {
      // Permainan tetap tersedia tanpa penyimpanan lokal.
    }
  }, []);

  const level = levels[levelIndex];
  const gameUnlocks = [
    { id: "pollination", name: "Jejak Si Lebah", threshold: 0, difficulty: "MUDAH", detail: "Jelajahi kebun dan bantu penyerbukan.", emoji: "🐝", accent: "bg-[#e3f0d5] dark:bg-[#334a32]" },
    { id: "memory", name: "Memory Match", threshold: GAME_UNLOCKS.memory, difficulty: "MENENGAH", detail: "Ingat dan cocokkan gambar organ.", emoji: "🧠", accent: "bg-[#e0e9f1] dark:bg-[#2e3c49]" },
    { id: "ecosystem", name: "Misi Penjaga Ekosistem", threshold: GAME_UNLOCKS.ecosystem, difficulty: "MENANTANG", detail: "Pulihkan habitat dengan menyusun rantai makanan.", emoji: "🌱", accent: "bg-[#e5e6d5] dark:bg-[#363b2d]" },
    { id: "bio-rush", name: "Bio Rush: Arena Biologi", threshold: GAME_UNLOCKS.bioRush, difficulty: "PALING SULIT", detail: "Tangkap istilah, hindari rintangan, dan pilih gerbang konsep.", emoji: "⚡", accent: "bg-[#e5edcf] dark:bg-[#35442d]" },
  ] as const;
  const unlockedGameCount = gameUnlocks.filter((game) => totalXp >= game.threshold).length;
  const nextUnlock = gameUnlocks
    .filter((game) => totalXp < game.threshold)
    .sort((a, b) => a.threshold - b.threshold)[0] ?? null;
  const unlockProgress = nextUnlock
    ? Math.min(100, (totalXp / nextUnlock.threshold) * 100)
    : 100;
  const organismById = new Map(
    cards.map((organism) => [organism.id, organism])
  );
  const placedIds = slots.filter((id): id is string => id !== null);
  const availableCards = cards.filter(
    (organism) => !placedIds.includes(organism.id)
  );

  function loadLevel(index: number) {
    setLevelIndex(index);
    setCards(shuffled(levels[index].deck));
    setSlots(Array(5).fill(null));
    setSelectedCard(null);
    setFeedback(null);
    setScreen("playing");
  }

  function startMission() {
    setHearts(3);
    setCombo(0);
    setScore(0);
    setScreen("mission-intro");
  }

  function beginMission() {
    loadLevel(0);
  }

  function selectOrganism(id: string) {
    const oldSlot = slots.indexOf(id);
    if (oldSlot !== -1) {
      setSlots((current) =>
        current.map((item, index) => (index === oldSlot ? null : item))
      );
    }
    setSelectedCard((current) => (current === id ? null : id));
    setFeedback(null);
  }

  function placeOrganism(slotIndex: number) {
    if (!selectedCard) {
      const existing = slots[slotIndex];
      if (existing) selectOrganism(existing);
      return;
    }
    setSlots((current) => {
      const next = [...current];
      next[slotIndex] = selectedCard;
      return next;
    });
    setSelectedCard(null);
    setFeedback(null);
  }

  function activateHabitat() {
    if (slots.some((item) => item === null)) return;
    const isBalanced = slots.every(
      (organismId, index) => organismId === level.chain[index]
    );
    if (!isBalanced) {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setCombo(0);
      setSlots(Array(5).fill(null));
      setSelectedCard(null);
      setFeedback("wrong");
      if (nextHearts <= 0) {
        setScreen("game-over");
      }
      return;
    }

    const reward = 100 + hearts * 25 + combo * 30;
    const nextScore = score + reward;
    const nextCombo = combo + 1;
    setScore(nextScore);
    setCombo(nextCombo);
    setFeedback(null);
    try {
      const newTotal = totalXp + reward;
      setTotalXp(newTotal);
      localStorage.setItem("biolearn-lounge-xp", String(newTotal));
    } catch {
      // Poin sesi tetap tercatat selama halaman terbuka.
    }

    if (levelIndex === levels.length - 1) {
      setScreen("finished");
    } else {
      setScreen("level-clear");
    }
  }

  function awardMemoryXp(reward: number) {
    const nextTotal = totalXp + reward;
    setTotalXp(nextTotal);
    try {
      localStorage.setItem("biolearn-lounge-xp", String(nextTotal));
    } catch {
      // Skor tetap tersedia selama sesi berjalan.
    }
  }

  if (activeGame === "memory") {
    return (
      <MemoryMatch
        totalXp={totalXp}
        onBack={() => setActiveGame(null)}
        onEarned={awardMemoryXp}
      />
    );
  }
  if (activeGame === "pollination") {
    return (
      <PollinationTrail
        totalXp={totalXp}
        onBack={() => setActiveGame(null)}
        onEarned={awardMemoryXp}
      />
    );
  }
  if (activeGame === "bio-rush") {
    return (
      <BioRush
        totalXp={totalXp}
        onBack={() => setActiveGame(null)}
        onEarned={awardMemoryXp}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-in fade-in duration-500">
      {screen !== "lobby" && (
        <button
          type="button"
          onClick={() => setScreen("lobby")}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-sage-800 transition-colors hover:bg-sage-100 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 dark:text-[#dce9c9] dark:hover:bg-[#263d2d] dark:hover:text-white dark:focus-visible:ring-[#a9c982]"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke pilihan permainan
        </button>
      )}
      <section className="relative overflow-hidden rounded-3xl border border-[#9ebd81] bg-gradient-to-br from-[#315f3d] via-[#397448] to-[#244f38] p-6 text-[#f4f7ea] shadow-xl shadow-[#244f38]/15 dark:border-[#395d40] dark:from-[#183624] dark:via-[#20442c] dark:to-[#142c20] md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-[#c1d95c]/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#e5efc8]">
              <Sparkles className="h-4 w-4" /> Belajar santai, tetap bertambah
              pintar
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Ruang Santai
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#d9e7d6] md:text-base">
              Empat permainan biologi, dari pemanasan hingga tantangan akhir.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-black/10 p-4 md:min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs text-[#d9e7d6]">
                  <Zap className="h-4 w-4 text-[#d7e88e]" /> XP PEMBUKA GAME
                </p>
                <p className="mt-1 text-2xl font-extrabold">{totalXp}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#e5efc8]">
                {unlockedGameCount} dari 4 game terbuka
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-[#dce9ae] transition-all"
                style={{ width: `${unlockProgress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#d9e7d6]/85">
              {nextUnlock
                ? `${Math.max(0, nextUnlock.threshold - totalXp)} XP lagi untuk membuka ${nextUnlock.name}`
                : "Semua permainan sudah terbuka"}
            </p>
          </div>
        </div>
      </section>

      <div
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <section className="min-w-0 rounded-3xl border border-sage-200 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-[#304636] dark:bg-[#192b20] md:p-6">
          {screen === "lobby" ? (
            <>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-[#edf4e2]">
                    Pilih permainan
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-[#aab9a7]">
                    Mulai dari yang mudah; XP-mu membuka tantangan berikutnya.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {gameUnlocks.map((game) => {
                  const unlocked = totalXp >= game.threshold;
                  const remaining = Math.max(0, game.threshold - totalXp);
                  return (
                    <article key={game.id} className="flex h-full min-h-[220px] flex-col rounded-2xl border border-sage-200 bg-gradient-to-br from-[#f8faf4] to-[#edf3e7] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#405747] dark:from-[#26392c] dark:to-[#203328]">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${game.accent}`} aria-hidden>{game.emoji}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold tracking-wide ${unlocked ? "bg-[#e3edcf] text-[#496d38] dark:bg-[#344a32] dark:text-[#d5e5bd]" : "bg-[#f2e9d4] text-[#88682e] dark:bg-[#403723] dark:text-[#e2c987]"}`}>{game.difficulty}</span>
                      </div>
                      <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-[#edf4e2]">{game.name}</h3>
                      <p className="mt-1 min-h-10 text-sm leading-snug text-slate-600 dark:text-[#b9c7b4]">{game.detail}</p>
                      <div className="mt-auto pt-3">
                        {!unlocked ? (
                          <>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-[#17271d]"><div className="h-full rounded-full bg-sage-600 dark:bg-[#b6d888]" style={{ width: `${Math.min(100, (totalXp / game.threshold) * 100)}%` }} /></div>
                            <p className="mt-1.5 text-xs font-medium text-slate-600 dark:text-[#c7d3c1]">{remaining} XP lagi · buka pada {game.threshold} XP</p>
                          </>
                        ) : <p className="text-xs font-semibold text-[#54763e] dark:text-[#b8d596]">Terbuka · XP tidak dipotong</p>}
                        <button
                          type="button"
                          disabled={!unlocked}
                          onClick={() => {
                            if (game.id === "ecosystem") startMission();
                            else setActiveGame(game.id);
                          }}
                          className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${unlocked ? "bg-[#536d42] text-white hover:bg-[#435a35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93b66c] dark:bg-[#3c5c3e] dark:hover:bg-[#496c40]" : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-[#25342a] dark:text-[#8c9c8a]"}`}
                        >
                          {unlocked ? <>Mainkan <ArrowRight className="h-4 w-4" /></> : <><LockKeyhole className="h-4 w-4" /> Terkunci</>}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : screen === "mission-intro" ? (
            <div className="relative isolate mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8f8ee] to-[#edf3e4] p-6 dark:from-[#26392c] dark:to-[#203328] md:p-9">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-[#78955c] dark:text-[#afc58b]">
                <svg viewBox="0 0 210 190" className="absolute -left-4 top-0 h-56 w-56 opacity-[0.11] blur-[0.2px]" fill="none" stroke="currentColor" strokeWidth="4"><path d="M102 167c2-48 1-87 1-118" strokeLinecap="round"/><path d="M103 124c-34-27-50-9-47 12 26 14 42 7 47-12Zm2-27c28-32 49-20 49 4-24 17-41 12-49-4Z" fill="currentColor" fillOpacity=".17"/><circle cx="103" cy="44" r="19"/><circle cx="103" cy="44" r="6" fill="currentColor"/></svg>
                <svg viewBox="0 0 220 170" className="absolute -bottom-5 -right-3 h-52 w-64 rotate-[-8deg] opacity-[0.1] blur-[0.2px]" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 40c36-27 68-23 91 0 25-23 57-27 93 0-36 27-68 23-93 0-23 23-55 27-91 0Z"/><path d="M18 85c36-27 68-23 91 0 25-23 57-27 93 0-36 27-68 23-93 0-23 23-55 27-91 0Z"/><path d="M18 130c36-27 68-23 91 0 25-23 57-27 93 0-36 27-68 23-93 0-23 23-55 27-91 0Z"/></svg>
              </div>
              <div className="relative z-10 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dce9ae]/90 text-4xl shadow-sm dark:bg-[#344a32]/90">🌱</span>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-sage-700 dark:text-[#b8d596]">Misi ekosistem · 3 habitat</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">Pulihkan rantai makanan</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-[#b9c7b4]">Susun organisme agar energi mengalir kembali di sawah, kolam, dan hutan.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#c7d3c1]"><span className="rounded-full bg-white/85 px-3 py-2 dark:bg-[#203328]/90">3 habitat berurutan</span><span className="rounded-full bg-white/85 px-3 py-2 dark:bg-[#203328]/90">3 hati</span><span className="rounded-full bg-white/85 px-3 py-2 dark:bg-[#203328]/90">XP membuka game</span></div>
                <button type="button" onClick={beginMission} className="btn-primary mt-6 inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Mulai misi</button>
              </div>
            </div>
          ) : screen === "playing" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {level.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-[#b8d596]">
                      Level {levelIndex + 1} · {level.habitat}
                    </p>
                    <h2 className="text-xl font-black text-slate-900 dark:text-[#edf4e2]">
                      {level.title}
                    </h2>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full border border-[#e5c3bd] bg-[#fff2ef] px-3 py-2 dark:border-[#624139] dark:bg-[#30211e]"
                  aria-label={`${hearts} energi tersisa`}
                >
                  {[0, 1, 2].map((heart) => (
                    <Heart
                      key={heart}
                      className={`h-4 w-4 ${heart < hearts ? "fill-[#d77d6b] text-[#d77d6b]" : "text-[#c9b8b4] dark:text-[#71534d]"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-[#b2c0ad]">
                {level.description}
            </p>
              <div className="mt-5 rounded-2xl border border-sage-200 bg-gradient-to-b from-[#f2f6e9] to-[#eaf1e1] p-4 dark:border-[#304636] dark:from-[#1d3023] dark:to-[#192b20] md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 dark:text-[#dce8d3]">
                    Jalur energi
                  </p>
                  <p className="flex items-center gap-1 text-xs font-semibold text-sage-700 dark:text-[#b8d596]">
                    <Flame className="h-4 w-4" /> Combo {combo}
                  </p>
                </div>
                <div className="-mx-1 overflow-x-auto px-1 pb-2">
                  <div className="grid min-w-[560px] grid-cols-5 gap-2 md:min-w-0 md:gap-3">
                    {roles.map((role, index) => {
                      const organism = slots[index]
                        ? organismById.get(slots[index]!)
                        : undefined;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => placeOrganism(index)}
                          className={`relative flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-2 text-center transition md:min-h-28 ${organism ? "border-[#80a663] bg-white shadow-sm dark:border-[#5d8047] dark:bg-[#223829]" : selectedCard ? "border-[#82a657] bg-[#f6faed] hover:bg-[#eaf3dc] dark:border-[#70934f] dark:bg-[#203829] dark:hover:bg-[#294532]" : "border-sage-300 bg-white/45 dark:border-[#405747] dark:bg-[#17271d]"}`}
                        >
                          {organism ? (
                            <>
                              <span className="text-2xl" aria-hidden>
                                {organism.emoji}
                              </span>
                              <span className="mt-1 max-w-full truncate text-xs font-bold text-slate-800 dark:text-[#edf4e2]">
                                {organism.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg text-sage-500 dark:text-[#8eaa6d]">
                                ＋
                              </span>
                              <span className="mt-1 text-[10px] font-semibold leading-tight text-slate-500 dark:text-[#9eaf9a]">
                                {role}
                              </span>
                            </>
                          )}
                          {index < roles.length - 1 && (
                            <ChevronRight className="absolute -right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-sage-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {selectedCard && (
                <p className="mt-3 text-center text-xs font-semibold text-sage-700 dark:text-[#b8d596]">
                  Kartu dipilih: {organismById.get(selectedCard)?.name} · ketuk
                  tempat yang diinginkan
                </p>
              )}
              {feedback === "wrong" && (
                <p
                  role="status"
                  className="mt-3 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm font-semibold text-[#873e34] dark:bg-[#3a2824] dark:text-[#f0c5b8]"
                >
                  Aliran energinya belum seimbang. Satu energi berkurang, coba
                  susun ulang!
                </p>
              )}
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-bold text-slate-900 dark:text-[#edf4e2]">
                    Kartu organisme
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#9eaf9a]">
                    Pilih kartu, lalu tempatkan di jalur
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availableCards.map((organism) => (
                    <button
                      key={organism.id}
                      type="button"
                      onClick={() => selectOrganism(organism.id)}
                      className={`rounded-2xl border p-3 text-left transition ${selectedCard === organism.id ? "border-[#6b9849] bg-[#eaf3dc] ring-2 ring-[#80b155]/25 dark:border-[#80a663] dark:bg-[#294532]" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sage-400 hover:shadow-sm dark:border-[#405747] dark:bg-[#203328] dark:hover:border-[#6e9b53]"}`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-2xl" aria-hidden>
                          {organism.emoji}
                        </span>
                        {selectedCard === organism.id && (
                          <Check className="h-4 w-4 text-sage-700 dark:text-[#cfe2b7]" />
                        )}
                      </span>
                      <span className="mt-2 block truncate text-sm font-bold text-slate-800 dark:text-[#edf4e2]">
                        {organism.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-[#304636]">
                <p className="text-sm font-semibold text-slate-600 dark:text-[#b2c0ad]">
                  XP misi ini{" "}
                  <span className="ml-1 text-lg font-black text-sage-800 dark:text-[#cfe2b7]">
                    {score} XP
                  </span>
                </p>
                <button
                  type="button"
                  onClick={activateHabitat}
                  disabled={slots.some((item) => item === null)}
                  className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Leaf className="h-4 w-4" /> Aktifkan habitat
                </button>
              </div>
            </>
          ) : screen === "level-clear" ? (
            <div className="py-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f1d9] text-[#4c7f3a] dark:bg-[#294532] dark:text-[#cfe2b7]">
                <Check className="h-8 w-8" />
              </span>
              <p className="mt-4 text-sm font-bold uppercase tracking-wide text-sage-700 dark:text-[#b8d596]">
                Habitat pulih!
              </p>
              <h2 className="mt-1 text-3xl font-black text-slate-900 dark:text-[#edf4e2]">
                +{100 + hearts * 25 + (combo - 1) * 30} XP
              </h2>
              <p className="mt-2 text-slate-600 dark:text-[#aab9a7]">
                Aliran energi di {level.habitat.toLowerCase()} sudah kembali
                seimbang. XP sudah ditambahkan ke Total XP.
              </p>
              <button
                type="button"
                onClick={() => loadLevel(levelIndex + 1)}
                className="btn-primary mt-6 inline-flex items-center gap-2"
              >
                Lanjut ke habitat berikutnya <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : screen === "finished" ? (
            <div className="py-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4edcb] text-[#98762c] dark:bg-[#3b321f] dark:text-[#e8cb78]">
                <Trophy className="h-8 w-8" />
              </span>
              <p className="mt-4 text-sm font-bold uppercase tracking-wide text-sage-700 dark:text-[#b8d596]">
                Misi tuntas!
              </p>
              <h2 className="mt-1 text-3xl font-black text-slate-900 dark:text-[#edf4e2]">
                Semua habitat terselamatkan
              </h2>
              <p className="mt-2 text-slate-600 dark:text-[#aab9a7]">
                Kamu mengumpulkan {score} XP dan menjaga keseimbangan sawah,
                kolam, serta hutan. XP ini sudah masuk ke Total XP.
              </p>
              <button
                type="button"
                onClick={startMission}
                className="btn-primary mt-6 inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Main lagi
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0eb] text-[#a64f42] dark:bg-[#3a2824] dark:text-[#f0b8ad]">
                <X className="h-8 w-8" />
              </span>
              <p className="mt-4 text-sm font-bold uppercase tracking-wide text-[#a64f42] dark:text-[#f0b8ad]">
                Energi habitat habis
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">
                Coba strategi baru
              </h2>
              <p className="mt-2 text-slate-600 dark:text-[#aab9a7]">
                Tidak apa-apa, setiap percobaan membantu memahami hubungan
                antarorganisme.
              </p>
              <button
                type="button"
                onClick={startMission}
                className="btn-primary mt-6 inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Ulangi misi
              </button>
            </div>
          )}
        </section>

        {screen === "lobby" ? (
          <aside className="right-side-panel lounge-side-panel rounded-3xl border border-sage-200 bg-white/85 p-5 shadow-sm dark:border-[#52704f] dark:bg-[#304a37]">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-[#edf4e2]">
              <Zap className="h-5 w-5 text-[#bd922e] dark:text-[#e8cb78]" />
              XP permainan
            </h2>
            <p className="mt-3 text-3xl font-black text-sage-800 dark:text-[#e0edcf]">{totalXp}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#d0ddc9]">Permainan terbuka: <span className="font-semibold text-slate-800 dark:text-[#edf4e2]">{unlockedGameCount} dari 4</span></p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-[#49634d]">
              <div className="h-full rounded-full bg-sage-600 transition-all dark:bg-[#b6d888]" style={{ width: `${unlockProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-[#d0ddc9]">
              {nextUnlock ? `${nextUnlock.threshold - totalXp} XP lagi membuka ${nextUnlock.name}` : "Semua permainan sudah terbuka"}
            </p>
            <div className="mt-5 rounded-2xl bg-sage-50 p-4 dark:bg-[#3b5740]">
              <p className="text-sm font-semibold text-slate-900 dark:text-[#f0f5e9]">Cara kerja XP</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#d6e1d1]">
                Selesaikan misi untuk mengumpulkan XP. Totalnya tidak dihabiskan saat membuka game, dan tidak memengaruhi nilai, tugas, atau hasil tes.
              </p>
            </div>
          </aside>
        ) : (
          <aside className="right-side-panel lounge-side-panel rounded-3xl border border-sage-200 bg-white/85 p-5 shadow-sm dark:border-[#52704f] dark:bg-[#304a37]">
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-[#edf4e2]">
              <Zap className="h-5 w-5 text-[#bd922e] dark:text-[#e8cb78]" />
              XP misi ini
            </h2>
            <p className="mt-3 text-3xl font-black text-sage-800 dark:text-[#cfe2b7]">
              {score} XP
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#b2c0ad]">
              XP dari misi ini membantu membuka permainan berikutnya. Tidak memengaruhi nilai, tugas, atau hasil tes.
            </p>
            <div className="mt-4 rounded-2xl bg-[#f4f6e8] p-4 dark:bg-[#203328]">
              <p className="text-sm font-bold text-slate-800 dark:text-[#e7f0de]">
                Cara mendapat XP
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#d0ddc9]">
                100 XP dasar + 25 XP per hati tersisa + 30 XP bonus untuk tiap
                habitat beruntun.
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-[#9eaf9a]">
              Susunan keliru mengurangi satu hati dan memutus bonus beruntun.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
