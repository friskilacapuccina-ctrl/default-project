"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Clock3,
  Heart,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

type MemoryCard = {
  id: string;
  pairId: string;
  title: string;
};

const pairs = [
  { id: "heart", name: "Jantung" },
  { id: "lungs", name: "Paru-paru" },
  { id: "stomach", name: "Lambung" },
  { id: "brain", name: "Otak" },
  { id: "liver", name: "Hati" },
  { id: "kidney", name: "Ginjal" },
  { id: "eye", name: "Mata" },
  { id: "tooth", name: "Gigi" },
  { id: "intestine", name: "Usus" },
  { id: "bladder", name: "Kandung kemih" },
];

function OrganIllustration({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-14 w-14 sm:h-16 sm:w-16"
      role="img"
      aria-hidden="true"
    >
      {id === "heart" && (
        <>
          <path
            d="M40 67 14 43C-1 25 22 8 40 25 58 8 81 25 66 43L40 67Z"
            fill="#e86762"
            stroke="#a93f45"
            strokeWidth="3"
          />
          <path
            d="M40 24v-9m0 9c-5-7-12-5-12 1m12-1c5-7 12-5 12 1"
            fill="none"
            stroke="#a93f45"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M24 38c6 2 8 8 8 13m24-13c-6 2-8 8-8 13"
            fill="none"
            stroke="#ffb3a3"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "lungs" && (
        <>
          <path
            d="M37 12v28M43 12v28M40 30 30 40m10-10 10 10"
            fill="none"
            stroke="#a93f45"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M31 30c-8 4-19 21-17 34 2 10 15 9 24 1V39c0-7-2-11-7-9Zm18 0c8 4 19 21 17 34-2 10-15 9-24 1V39c0-7 2-11 7-9Z"
            fill="#ef9c9e"
            stroke="#ad5e68"
            strokeWidth="3"
          />
          <path
            d="M29 43c-4 5-6 11-6 17m28-17c4 5 6 11 6 17"
            fill="none"
            stroke="#fff0df"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "stomach" && (
        <>
          <path
            d="M34 12c1 10 0 18-7 23-9 7-11 20-3 29 9 10 28 8 38-2 9-9 7-19-2-22-7-2-13 3-18-1-6-5-3-16-3-27Z"
            fill="#ed9a82"
            stroke="#a9574f"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M34 14c4 2 10 2 14 0M26 50c7-6 16-7 24-2"
            fill="none"
            stroke="#ffd0ad"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "brain" && (
        <>
          <path
            d="M39 18c-8-10-22-3-20 7-10 2-11 17-3 21-5 10 3 20 13 18 5 9 14 7 14-1V22c0-4-2-6-4-4Zm2 0c8-10 22-3 20 7 10 2 11 17 3 21 5 10-3 20-13 18-5 9-14 7-14-1V22c0-4 2-6 4-4Z"
            fill="#e8a3a6"
            stroke="#a95c70"
            strokeWidth="3"
          />
          <path
            d="M20 31c7-5 11 1 7 6m-4 11c7-5 11 1 7 6m30-23c-7-5-11 1-7 6m4 11c-7-5-11 1-7 6"
            fill="none"
            stroke="#bd7182"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M40 20v41" stroke="#a95c70" strokeWidth="2" />
        </>
      )}
      {id === "liver" && (
        <>
          <path
            d="M10 35c8-15 26-23 47-19 10 2 15 9 13 19-2 12-12 21-27 22l-21 5c-12 3-20-4-18-14 1-5 3-9 6-13Z"
            fill="#a95a4d"
            stroke="#713d3b"
            strokeWidth="3"
          />
          <path
            d="M44 19c-2 11-2 22 2 36m-28-13c11 2 17 0 25-6"
            fill="none"
            stroke="#d98b70"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "kidney" && (
        <>
          <path
            d="M47 13c15 0 23 12 20 27-3 16-14 29-28 28-12-1-19-12-17-24 1-8 6-12 5-20-1-7 8-11 20-11Z"
            fill="#c96f72"
            stroke="#81464c"
            strokeWidth="3"
          />
          <path
            d="M44 30c-8 4-11 13-5 19 4 4 10 3 13-2-5 1-8-2-7-6 1-4 4-7 9-9-3-3-6-4-10-2Z"
            fill="#f3c5a7"
            stroke="#a95c62"
            strokeWidth="2"
          />
          <path
            d="M49 45c6 2 10 6 12 12"
            fill="none"
            stroke="#e8bc87"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "eye" && (
        <>
          <path
            d="M7 40c8-15 20-23 33-23s25 8 33 23c-8 15-20 23-33 23S15 55 7 40Z"
            fill="#fff7df"
            stroke="#536f59"
            strokeWidth="3"
          />
          <circle
            cx="40"
            cy="40"
            r="15"
            fill="#72a7c8"
            stroke="#477b99"
            strokeWidth="3"
          />
          <circle cx="40" cy="40" r="7" fill="#263a42" />
          <circle cx="35" cy="34" r="3" fill="#fff" />
        </>
      )}
      {id === "tooth" && (
        <>
          <path
            d="M22 16c7-5 13 0 18 0s11-5 18 0c9 6 3 20 0 28-4 11-7 23-13 22-5-1-3-19-8-19s-3 18-8 19c-6 1-9-11-13-22-3-8-9-22 0-28Z"
            fill="#fff8e8"
            stroke="#b49b70"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M27 23c4-3 8-1 11 0m4 0c3-1 7-3 11 0"
            fill="none"
            stroke="#ead8b4"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "intestine" && (
        <>
          <path
            d="M25 17c-9 0-12 7-12 15v17c0 9 5 14 14 14h26c9 0 14-5 14-14V32c0-8-3-15-12-15"
            fill="none"
            stroke="#ce7f68"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 25c-7 3 8 8 0 12s8 8 0 12 8 7 0 11m26-35c7 3-8 8 0 12s-8 8 0 12-8 7 0 11"
            fill="none"
            stroke="#f0b098"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M29 31h22M29 43h22M29 55h22"
            stroke="#a95c4e"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "bladder" && (
        <>
          <path
            d="M29 13v12m22-12v12"
            stroke="#b9626c"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M29 23c-3 7-13 12-13 25 0 14 11 22 24 22s24-8 24-22c0-13-10-18-13-25-6 4-16 4-22 0Z"
            fill="#e89198"
            stroke="#a95763"
            strokeWidth="3"
          />
          <path
            d="M40 64v6"
            stroke="#a95763"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M29 33c-4 5-6 9-6 15"
            fill="none"
            stroke="#ffc3b4"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeCards(selectedPairs: typeof pairs): MemoryCard[] {
  return shuffled(
    selectedPairs.flatMap((pair) => [
      {
        id: `${pair.id}-a`,
        pairId: pair.id,
        title: pair.name,
      },
      {
        id: `${pair.id}-b`,
        pairId: pair.id,
        title: pair.name,
      },
    ])
  );
}

export function MemoryMatch({
  totalXp,
  onBack,
  onEarned,
}: {
  totalXp: number;
  onBack: () => void;
  onEarned: (xp: number) => void;
}) {
  const [screen, setScreen] = useState<
    "intro" | "preview" | "playing" | "stage-clear" | "done" | "game-over"
  >("intro");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [previewSeconds, setPreviewSeconds] = useState(5);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hearts, setHearts] = useState(3);
  const [locked, setLocked] = useState(false);
  const [reward, setReward] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [easyCompleted, setEasyCompleted] = useState(false);
  const activePairs = difficulty === "easy" ? pairs.slice(0, 6) : pairs;

  useEffect(() => {
    try {
      setEasyCompleted(
        localStorage.getItem("biolearn-memory-easy-completed") === "true"
      );
    } catch {
      // Tahap mudah tetap dapat dimainkan tanpa penyimpanan lokal.
    }
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "preview") return;
    if (previewSeconds <= 0) {
      setScreen("playing");
      setTimeLeft(60);
      return;
    }
    const timer = window.setTimeout(
      () => setPreviewSeconds((value) => value - 1),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [screen, previewSeconds]);

  useEffect(() => {
    if (screen !== "playing" || locked) return;
    if (timeLeft <= 0) {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setFlipped([]);
      if (nextHearts <= 0) {
        setScreen("game-over");
      } else {
        setTimeLeft(60);
      }
      return;
    }
    const timer = window.setTimeout(
      () => setTimeLeft((value) => value - 1),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [screen, timeLeft, hearts, locked]);

  function startGame(stage: "easy" | "hard" = difficulty) {
    const stagePairs = stage === "easy" ? pairs.slice(0, 6) : pairs;
    setDifficulty(stage);
    setCards(makeCards(stagePairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setPreviewSeconds(5);
    setTimeLeft(60);
    setHearts(3);
    setLocked(false);
    setReward(0);
    setScreen("preview");
  }

  function finishIfComplete(nextMatched: string[], nextMoves: number) {
    if (nextMatched.length !== activePairs.length) return;
    const points = Math.max(
      60,
      activePairs.length * 50 - nextMoves * 12 - seconds * 2
    );
    setReward(points);
    onEarned(points);
    if (difficulty === "easy") {
      setEasyCompleted(true);
      try {
        localStorage.setItem("biolearn-memory-easy-completed", "true");
      } catch {
        // Progres tahap tetap tersedia selama halaman terbuka.
      }
    }
    setScreen(difficulty === "easy" ? "stage-clear" : "done");
  }

  function flipCard(index: number) {
    if (
      locked ||
      flipped.includes(index) ||
      matched.includes(cards[index]?.pairId)
    )
      return;
    if (flipped.length === 0) {
      setFlipped([index]);
      return;
    }

    const firstIndex = flipped[0];
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setFlipped([firstIndex, index]);
    setLocked(true);

    const firstCard = cards[firstIndex];
    const secondCard = cards[index];
    if (firstCard.pairId === secondCard.pairId) {
      const nextMatched = [...matched, firstCard.pairId];
      window.setTimeout(() => {
        setMatched(nextMatched);
        setFlipped([]);
        setLocked(false);
        finishIfComplete(nextMatched, nextMoves);
      }, 500);
    } else {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      window.setTimeout(() => {
        setFlipped([]);
        setLocked(false);
        if (nextHearts <= 0) setScreen("game-over");
      }, 900);
    }
  }

  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 animate-in fade-in duration-300">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-sage-800 transition hover:text-sage-600 dark:text-[#cfe2b7] dark:hover:text-[#e1efcd]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Ruang Santai
      </button>

      <section className="overflow-hidden rounded-3xl border border-sage-200 bg-white/90 shadow-sm dark:border-[#304636] dark:bg-[#192b20]">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#315f3d] to-[#4e7d43] px-5 py-5 text-white dark:from-[#203e2b] dark:to-[#294d33] md:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Brain className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#dce9ae]">
                Permainan memori
              </p>
              <h1 className="text-xl font-black md:text-2xl">
                Memory Match: Organ Tubuh
              </h1>
            </div>
          </div>
          <p className="rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-sm font-semibold">
            <Zap className="mr-1 inline h-4 w-4 text-[#e4edaa]" /> {totalXp} XP
            terkumpul
          </p>
        </header>

        {screen === "intro" ? (
          <div className="relative isolate mx-auto max-w-3xl overflow-hidden p-5 md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <span className="absolute -left-5 top-8 opacity-[0.09] blur-[0.3px]">
                <span className="block scale-[2.8]">
                  <OrganIllustration id="heart" />
                </span>
              </span>
              <span className="absolute -right-3 top-24 opacity-[0.08] blur-[0.3px]">
                <span className="block rotate-12 scale-[3.1]">
                  <OrganIllustration id="lungs" />
                </span>
              </span>
              <span className="absolute -bottom-2 left-[22%] opacity-[0.06] blur-[0.4px]">
                <span className="block -rotate-12 scale-[2.6]">
                  <OrganIllustration id="brain" />
                </span>
              </span>
              <span className="absolute -bottom-4 right-[18%] opacity-[0.07] blur-[0.3px]">
                <span className="block rotate-6 scale-[2.4]">
                  <OrganIllustration id="stomach" />
                </span>
              </span>
            </div>
            <div className="relative z-10">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage-700 dark:text-[#b8d596]">
                  Cocokkan organ yang sama
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">
                  Pilih tahap permainan
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-[#b2c0ad]">
                  Tahap sulit terbuka setelah tahap mudah selesai.
                </p>
              </div>
              <div className="mt-5 grid gap-3 text-left sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startGame("easy")}
                  className="group rounded-2xl border border-[#80a663] bg-[#edf5e4] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#5d8047] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ba658] dark:border-[#5d8047] dark:bg-[#233a2a] dark:hover:bg-[#294532]"
                >
                  <p className="flex items-center justify-between gap-2 font-extrabold text-slate-900 dark:text-[#edf4e2]">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dce9ae] text-xs text-[#315f3d] dark:bg-[#354a2c] dark:text-[#dce9ae]">
                        1
                      </span>
                      Mudah
                    </span>
                    <span className="rounded-full bg-[#dce9ae] px-2.5 py-1 text-[11px] text-[#315f3d] dark:bg-[#354a2c] dark:text-[#dce9ae]">
                      {easyCompleted ? "Selesai" : "6 pasangan"}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-[#aab9a7]">
                    12 kartu · cocok untuk pemanasan
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#315f3d] group-hover:gap-3 dark:text-[#dce9ae]">
                    {easyCompleted ? "Mainkan lagi" : "Mulai tahap mudah"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => easyCompleted && startGame("hard")}
                  disabled={!easyCompleted}
                  className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ba658] ${easyCompleted ? "group border-[#80a663] bg-[#edf5e4] hover:-translate-y-0.5 hover:shadow-md dark:border-[#5d8047] dark:bg-[#233a2a] dark:hover:bg-[#294532]" : "cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-75 dark:border-[#405747] dark:bg-[#203328]"}`}
                >
                  <p className="flex items-center justify-between gap-2 font-extrabold text-slate-900 dark:text-[#edf4e2]">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600 dark:bg-[#34483a] dark:text-[#b2c0ad]">
                        2
                      </span>
                      Sulit
                    </span>
                    <span className="rounded-full bg-[#f4e6d4] px-2.5 py-1 text-[11px] text-[#81562c] dark:bg-[#3c3023] dark:text-[#e6c18a]">
                      {easyCompleted ? "10 pasangan" : "Terkunci"}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-[#aab9a7]">
                    20 kartu · tantangan lanjutan
                  </p>
                  <span
                    className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${easyCompleted ? "text-[#315f3d] group-hover:gap-3 dark:text-[#dce9ae]" : "text-slate-500 dark:text-[#aab9a7]"}`}
                  >
                    {easyCompleted
                      ? "Mulai tahap sulit"
                      : "Selesaikan tahap mudah dulu"}
                    {easyCompleted && <ArrowRight className="h-4 w-4" />}
                  </span>
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-[#aab9a7]">
                3 hati · 60 detik per hati · hafalkan posisi selama 5 detik
              </p>
              <div className="mx-auto mt-5 flex max-w-2xl flex-col gap-2 rounded-xl border border-sage-200 bg-sage-50/80 px-4 py-3 text-sm dark:border-[#405747] dark:bg-[#203328] sm:flex-row sm:items-center sm:justify-between">
                <span className="font-bold text-slate-800 dark:text-[#dce8d3]">
                  Poin permainan
                </span>
                <span className="text-slate-600 dark:text-[#b2c0ad]">
                  XP membuka pangkat permainan dan tidak mengubah nilai atau tugas.
                </span>
              </div>
            </div>
          </div>
        ) : screen === "preview" || screen === "playing" ? (
          <div className="p-4 md:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2 text-sm font-bold text-slate-700 dark:text-[#dce8d3]">
                <span className="rounded-xl bg-sage-50 px-3 py-2 dark:bg-[#203328]">
                  Pasangan {matched.length}/{activePairs.length}
                </span>
                <span className="rounded-xl bg-sage-50 px-3 py-2 dark:bg-[#203328]">
                  Langkah {moves}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-xl bg-[#fff0eb] px-2.5 py-2 dark:bg-[#30211e]"
                  aria-label={`${hearts} hati tersisa`}
                >
                  {[0, 1, 2].map((heart) => (
                    <Heart
                      key={heart}
                      className={`h-4 w-4 ${heart < hearts ? "fill-[#d77d6b] text-[#d77d6b]" : "text-[#c9b8b4] dark:text-[#71534d]"}`}
                    />
                  ))}
                </span>
                <span
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${screen === "preview" ? "bg-[#e8f1d9] text-sage-800 dark:bg-[#294532] dark:text-[#cfe2b7]" : timeLeft <= 10 ? "bg-[#fff0eb] text-[#a64f42] dark:bg-[#3a2824] dark:text-[#f0b8ad]" : "bg-[#f4f6e8] text-sage-800 dark:bg-[#203328] dark:text-[#cfe2b7]"}`}
                >
                  <Clock3 className="h-4 w-4" />{" "}
                  {screen === "preview"
                    ? `Hafalkan 00:${String(previewSeconds).padStart(2, "0")}`
                    : `Sisa ${Math.floor(timeLeft / 60)
                        .toString()
                        .padStart(
                          2,
                          "0"
                        )}:${String(timeLeft % 60).padStart(2, "0")}`}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5">
              {cards.map((card, index) => {
                const isFaceUp =
                  screen === "preview" ||
                  flipped.includes(index) ||
                  matched.includes(card.pairId);
                const isMatched = matched.includes(card.pairId);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => flipCard(index)}
                    disabled={screen !== "playing" || locked || isMatched}
                    aria-label={
                      isFaceUp ? card.title : `Kartu tertutup ${index + 1}`
                    }
                    aria-pressed={isFaceUp}
                    className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all duration-200 sm:min-h-32 sm:p-3 ${isMatched ? "scale-[0.98] border-[#8bb46c] bg-[#eaf3dc] text-[#315f3d] opacity-70 dark:border-[#5e8447] dark:bg-[#294532] dark:text-[#d5e8be]" : isFaceUp ? "rotate-0 border-[#7ba658] bg-[#f0f6e8] text-slate-800 shadow-md dark:border-[#6e9b53] dark:bg-[#263d2c] dark:text-[#edf4e2]" : "border-sage-300 bg-gradient-to-br from-[#e8f0d9] to-[#dce9c7] text-sage-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-[#405747] dark:from-[#294532] dark:to-[#203328] dark:text-[#d3e4bf]"}`}
                  >
                    {isFaceUp ? (
                      <>
                        <OrganIllustration id={card.pairId} />
                        <span className="mt-1 text-xs font-extrabold text-slate-800 dark:text-[#edf4e2]">
                          {card.title}
                        </span>
                        {isMatched && <Check className="mt-1 h-4 w-4" />}
                      </>
                    ) : (
                      <span className="text-3xl font-black opacity-75">?</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-sm font-semibold text-slate-600 dark:text-[#b2c0ad]">
              {screen === "preview"
                ? "Hafalkan posisi dan nama organ sebelum kartu tertutup!"
                : "Pasangan keliru mengurangi satu hati. Jika waktu habis, satu hati juga berkurang."}
            </p>
          </div>
        ) : screen === "stage-clear" ? (
          <div className="p-6 text-center md:p-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f1d9] text-[#4c7f3a] dark:bg-[#294532] dark:text-[#cfe2b7]">
              <Check className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-sage-700 dark:text-[#b8d596]">
              Tahap mudah selesai
            </p>
            <h2 className="mt-1 text-3xl font-black text-slate-900 dark:text-[#edf4e2]">
              +{reward} XP
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#b2c0ad]">
              Hebat! Kamu menemukan semua 6 pasangan. Tahap sulit sekarang
              terbuka dengan 20 kartu. XP tahap ini sudah ditambahkan ke Total
              XP.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startGame("hard")}
                className="btn-primary inline-flex items-center gap-2"
              >
                Lanjut ke Tahap Sulit <Sparkles className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => startGame("easy")}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Ulangi Tahap Mudah
              </button>
            </div>
          </div>
        ) : screen === "done" ? (
          <div className="p-6 text-center md:p-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4edcb] text-[#98762c] dark:bg-[#3b321f] dark:text-[#e8cb78]">
              <Trophy className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-sage-700 dark:text-[#b8d596]">
              Semua pasangan ditemukan
            </p>
            <h2 className="mt-1 text-3xl font-black text-slate-900 dark:text-[#edf4e2]">
              +{reward} XP
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#b2c0ad]">
              Selesai dalam {moves} langkah dan {minutes}:{remainingSeconds}. XP
              tahap sulit sudah ditambahkan ke Total XP.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startGame("easy")}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Main lagi
              </button>
              <button type="button" onClick={onBack} className="btn-secondary">
                Kembali ke permainan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center md:p-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0eb] text-[#a64f42] dark:bg-[#3a2824] dark:text-[#f0b8ad]">
              <Heart className="h-8 w-8 fill-current" />
            </span>
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-[#a64f42] dark:text-[#f0b8ad]">
              Semua hati habis
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">
              Coba ingat posisi kartunya lagi
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#b2c0ad]">
              Kali ini semua kartu akan dibuka dulu selama 5 detik.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startGame()}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Coba lagi
              </button>
              <button type="button" onClick={onBack} className="btn-secondary">
                Kembali ke permainan
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
