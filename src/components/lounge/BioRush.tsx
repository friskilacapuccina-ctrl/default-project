"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Clock3,
  Heart,
  Gamepad2,
  Leaf,
  PersonStanding,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { translate, useLanguage } from "@/components/layout/LanguageProvider";

type MaterialId = "cell" | "plant" | "digestion" | "respiration" | "circulation" | "ecosystem";
type RushTerm = {
  label: string;
  prompt: string;
  choices: [string, string, string];
  answerIndex: number;
  explanation: string;
  event?: boolean;
};
type FallingObject = {
  id: number;
  kind: "term" | "obstacle";
  lane: number;
  y: number;
  term?: RushTerm;
};
type PendingFeedback = { correct: boolean; text: string; points: number; answerText: string };

const materials: { id: MaterialId; title: string; short: string; color: string; symbol: string }[] = [
  { id: "cell", title: "Sel dan Struktur Sel", short: "Organel & fungsi", color: "from-fuchsia-100 to-violet-100 dark:from-[#423149] dark:to-[#30293e]", symbol: "◉" },
  { id: "plant", title: "Jaringan pada Tumbuhan", short: "Xilem & floem", color: "from-emerald-100 to-lime-100 dark:from-[#294739] dark:to-[#38472b]", symbol: "❋" },
  { id: "digestion", title: "Sistem Pencernaan", short: "Jalur & proses organ", color: "from-orange-100 to-amber-100 dark:from-[#48352e] dark:to-[#4a4027]", symbol: "↻" },
  { id: "respiration", title: "Sistem Pernapasan", short: "Jalur udara & alveolus", color: "from-sky-100 to-cyan-100 dark:from-[#293e4a] dark:to-[#294444]", symbol: "≈" },
  { id: "circulation", title: "Sistem Peredaran Darah", short: "Jantung & pembuluh", color: "from-rose-100 to-red-100 dark:from-[#482f34] dark:to-[#452f2b]", symbol: "♥" },
  { id: "ecosystem", title: "Ekosistem", short: "Organisme & keseimbangan", color: "from-green-100 to-teal-100 dark:from-[#2e4734] dark:to-[#293f40]", symbol: "♧" },
];

const questionBank: Record<MaterialId, RushTerm[]> = {
  cell: [
    { label: "Mitokondria", prompt: "Ke gerbang fungsi manakah organel ini harus dibawa?", choices: ["Penghasil energi", "Pengatur aktivitas sel", "Pembuat protein"], answerIndex: 0, explanation: "Mitokondria menjadi tempat utama respirasi sel untuk menghasilkan ATP sebagai sumber energi." },
    { label: "Nukleus", prompt: "Apa peran utama organel ini?", choices: ["Mengatur aktivitas sel", "Menyimpan cadangan air", "Menyusun dinding sel"], answerIndex: 0, explanation: "Nukleus menyimpan DNA dan mengatur berbagai aktivitas sel." },
    { label: "Ribosom", prompt: "Pilih fungsi yang sesuai dengan organel ini.", choices: ["Membuat protein", "Menghasilkan energi", "Mengendalikan keluar-masuk zat"], answerIndex: 0, explanation: "Ribosom merangkai asam amino menjadi protein." },
    { label: "Membran sel", prompt: "Pilih fungsi membran sel.", choices: ["Mengatur pertukaran zat", "Tempat fotosintesis", "Menyimpan informasi genetik"], answerIndex: 0, explanation: "Membran sel bersifat selektif dan mengatur zat yang masuk atau keluar." },
    { label: "Kloroplas", prompt: "Organel ini paling tepat dibawa ke gerbang apa?", choices: ["Tempat fotosintesis", "Pengatur aktivitas sel", "Pembuat protein"], answerIndex: 0, explanation: "Kloroplas mengandung klorofil dan menjadi tempat berlangsungnya fotosintesis pada tumbuhan." },
    { label: "Lisosom", prompt: "Organel ini membantu sel dengan cara…", choices: ["Mencerna zat dan bagian sel yang rusak", "Menyimpan DNA", "Membentuk benang spindel"], answerIndex: 0, explanation: "Enzim dalam lisosom menguraikan zat, mikroorganisme, dan organel yang telah rusak." },
    { label: "Badan Golgi", prompt: "Vesikel yang membawa protein menuju membran biasanya diproses oleh…", choices: ["Badan Golgi", "Mitokondria", "Sentriol"], answerIndex: 0, explanation: "Badan Golgi memodifikasi, mengemas, dan mendistribusikan protein atau molekul lain." },
    { label: "Retikulum endoplasma", prompt: "Retikulum endoplasma kasar berperan dalam…", choices: ["Sintesis dan pengangkutan protein", "Respirasi sel", "Penyimpanan air pada tumbuhan"], answerIndex: 0, explanation: "Ribosom pada retikulum endoplasma kasar membuat protein yang kemudian diproses dan diangkut." },
    { label: "Vakuola", prompt: "Pada sel tumbuhan, vakuola besar terutama membantu…", choices: ["Menyimpan zat dan menjaga tekanan turgor", "Membuat protein", "Mengatur pembelahan inti"], answerIndex: 0, explanation: "Vakuola menyimpan air serta berbagai zat dan membantu mempertahankan tekanan turgor." },
    { label: "Dinding sel", prompt: "Struktur ini membantu sel tumbuhan dengan…", choices: ["Memberi bentuk dan perlindungan", "Menghasilkan ATP", "Mengatur seluruh aktivitas sel"], answerIndex: 0, explanation: "Dinding sel yang tersusun terutama dari selulosa memberi dukungan dan perlindungan." },
  ],
  plant: [
    { label: "Air dari akar", prompt: "Jaringan apa yang mengangkut air dan mineral ke daun?", choices: ["Xilem", "Floem", "Epidermis"], answerIndex: 0, explanation: "Xilem mengangkut air dan mineral dari akar menuju bagian tumbuhan lain, terutama daun." },
    { label: "Hasil fotosintesis", prompt: "Jaringan apa yang menyalurkan gula hasil fotosintesis?", choices: ["Floem", "Xilem", "Meristem"], answerIndex: 0, explanation: "Floem menyalurkan hasil fotosintesis dari daun ke bagian tumbuhan yang membutuhkan atau menyimpannya." },
    { label: "Pembuluh kayu", prompt: "Istilah ini merujuk pada jaringan pengangkut yang mana?", choices: ["Xilem", "Floem", "Kolenkim"], answerIndex: 0, explanation: "Xilem sering disebut pembuluh kayu dan dindingnya umumnya diperkuat lignin." },
    { label: "Tabung tapis", prompt: "Komponen ini merupakan bagian dari jaringan apa?", choices: ["Floem", "Xilem", "Sklerenkim"], answerIndex: 0, explanation: "Tabung tapis adalah unsur utama floem yang membantu distribusi hasil fotosintesis." },
    { label: "Mineral tanah", prompt: "Mineral yang diserap akar bergerak ke atas terutama melalui…", choices: ["Xilem", "Floem", "Kambium"], answerIndex: 0, explanation: "Mineral terlarut diangkut bersama air melalui xilem." },
    { label: "Gula dari daun", prompt: "Hasil fotosintesis menuju akar terutama melalui…", choices: ["Floem", "Xilem", "Epidermis"], answerIndex: 0, explanation: "Floem menyalurkan hasil fotosintesis ke organ yang memerlukan atau menyimpannya." },
    { label: "Stomata", prompt: "Struktur daun ini terutama berfungsi untuk…", choices: ["Pertukaran gas dan pengaturan penguapan", "Mengangkut air dari akar", "Menyerap mineral dari tanah"], answerIndex: 0, explanation: "Stomata mengatur pertukaran gas dan transpirasi melalui buka-tutup sel penjaga." },
    { label: "Epidermis", prompt: "Jaringan terluar tumbuhan terutama berfungsi untuk…", choices: ["Melindungi jaringan di bawahnya", "Mengangkut gula ke seluruh tumbuhan", "Membentuk serbuk sari"], answerIndex: 0, explanation: "Epidermis menutupi permukaan tumbuhan dan membantu melindungi jaringan di dalamnya." },
    { label: "Meristem", prompt: "Jaringan dengan sel aktif membelah ini membantu…", choices: ["Pertumbuhan tumbuhan", "Pengangkutan hasil fotosintesis saja", "Penyimpanan udara di paru-paru"], answerIndex: 0, explanation: "Sel meristem terus membelah dan menghasilkan sel baru untuk pertumbuhan." },
    { label: "Kambium", prompt: "Aktivitas kambium pada batang menyebabkan…", choices: ["Pertumbuhan diameter sekunder", "Pengangkutan oksigen ke daun", "Pembentukan klorofil di akar"], answerIndex: 0, explanation: "Kambium menghasilkan xilem dan floem sekunder sehingga batang bertambah besar." },
  ],
  digestion: [
    { label: "Mulut", prompt: "Makanan baru ditelan. Organ apa yang harus dilewati berikutnya?", choices: ["Kerongkongan", "Lambung", "Usus halus"], answerIndex: 0, explanation: "Setelah mulut, bolus bergerak melalui kerongkongan sebelum masuk ke lambung." },
    { label: "Kerongkongan", prompt: "Bolus tiba di ujung kerongkongan. Ke organ mana ia bergerak selanjutnya?", choices: ["Lambung", "Usus besar", "Rektum"], answerIndex: 0, explanation: "Gerak peristaltik mendorong bolus dari kerongkongan menuju lambung." },
    { label: "Lambung", prompt: "Kimus keluar dari lambung. Ke mana jalurnya berlanjut?", choices: ["Usus halus", "Kerongkongan", "Usus besar"], answerIndex: 0, explanation: "Kimus masuk ke usus halus, tempat pencernaan lanjutan dan penyerapan nutrisi berlangsung." },
    { label: "Usus halus", prompt: "Setelah sebagian besar nutrisi diserap, sisa makanan bergerak ke…", choices: ["Usus besar", "Rektum", "Lambung"], answerIndex: 0, explanation: "Sisa pencernaan dari usus halus bergerak ke usus besar untuk penyerapan air." },
    { label: "Usus besar", prompt: "Air telah diserap. Ke bagian mana feses ditampung sementara?", choices: ["Rektum", "Mulut", "Usus halus"], answerIndex: 0, explanation: "Feses bergerak dari usus besar menuju rektum untuk ditampung sementara." },
    { label: "Rektum", prompt: "Feses siap dikeluarkan. Bagian akhir yang dilewati adalah…", choices: ["Anus", "Lambung", "Kerongkongan"], answerIndex: 0, explanation: "Feses keluar dari tubuh melalui anus setelah ditampung di rektum." },
    { label: "Anus", prompt: "Apa fungsi organ ini pada akhir jalur pencernaan?", choices: ["Mengeluarkan feses", "Menyerap glukosa", "Mengaduk kimus"], answerIndex: 0, explanation: "Anus menjadi jalan keluarnya feses dari tubuh." },
    { label: "Hati", prompt: "Cairan yang dibuat hati membantu pencernaan lemak. Cairan itu adalah…", choices: ["Empedu", "Pepsin", "Saliva"], answerIndex: 0, explanation: "Hati menghasilkan empedu, yang membantu mengemulsikan lemak di usus halus." },
    { label: "Pankreas", prompt: "Enzim pankreas dialirkan ke usus halus untuk…", choices: ["Membantu mencerna karbohidrat, protein, dan lemak", "Menyerap air dari feses", "Mendorong bolus dengan gerak peristaltik"], answerIndex: 0, explanation: "Pankreas mengeluarkan enzim pencernaan yang bekerja pada beberapa jenis zat makanan." },
    { label: "Kantung empedu", prompt: "Apa yang dilakukan kantung empedu?", choices: ["Menyimpan dan memekatkan empedu", "Menghasilkan pepsin", "Menyerap asam amino ke darah"], answerIndex: 0, explanation: "Kantung empedu menyimpan empedu dari hati dan melepaskannya ke usus halus." },
  ],
  respiration: [
    { label: "Hidung", prompt: "Apa manfaat utama udara melewati hidung?", choices: ["Disaring, dihangatkan, dan dilembapkan", "Oksigen langsung masuk ke sel", "Karbon dioksida diubah menjadi glukosa"], answerIndex: 0, explanation: "Rambut dan lendir membantu menyaring partikel; rongga hidung juga menghangatkan dan melembapkan udara." },
    { label: "Faring", prompt: "Faring merupakan persimpangan yang menghubungkan rongga hidung dengan…", choices: ["Laring", "Alveolus", "Diafragma"], answerIndex: 0, explanation: "Udara dari rongga hidung melewati faring sebelum menuju laring." },
    { label: "Trakea", prompt: "Cincin tulang rawan pada trakea membantu…", choices: ["Menjaga saluran tetap terbuka", "Memompa darah ke paru-paru", "Menyerap karbon dioksida"], answerIndex: 0, explanation: "Cincin tulang rawan mencegah trakea menutup sehingga udara tetap dapat lewat." },
    { label: "Bronkiolus", prompt: "Saluran kecil ini mengarahkan udara menuju…", choices: ["Alveolus", "Kerongkongan", "Ventrikel kiri"], answerIndex: 0, explanation: "Bronkiolus bercabang halus dan berakhir pada kumpulan alveolus." },
    { label: "Alveolus", prompt: "Apa yang terjadi pada dinding alveolus yang tipis?", choices: ["O₂ dan CO₂ berdifusi antara udara dan darah", "Makanan dipecah menjadi asam amino", "Darah dipompa ke seluruh tubuh"], answerIndex: 0, explanation: "Alveolus menjadi tempat pertukaran gas: oksigen masuk darah dan karbon dioksida keluar." },
    { label: "Laring", prompt: "Laring dikenal sebagai tempat terdapatnya…", choices: ["Pita suara", "Vili usus", "Katup jantung"], answerIndex: 0, explanation: "Laring menghubungkan faring dengan trakea dan memiliki pita suara." },
    { label: "Bronkus", prompt: "Bronkus menghubungkan trakea dengan…", choices: ["Paru-paru", "Lambung", "Kapiler usus"], answerIndex: 0, explanation: "Trakea bercabang menjadi dua bronkus yang masuk ke paru-paru." },
    { label: "Epiglotis", prompt: "Saat menelan, epiglotis membantu…", choices: ["Menutup jalan napas agar makanan tidak masuk trakea", "Membuka alveolus", "Menyaring darah"], answerIndex: 0, explanation: "Epiglotis menutup laring saat menelan sehingga makanan diarahkan ke kerongkongan." },
    { label: "Diafragma", prompt: "Saat menarik napas, diafragma berkontraksi dan…", choices: ["Mendatar sehingga rongga dada membesar", "Mendorong udara keluar dengan mengecilkan rongga dada", "Menutup bronkus"], answerIndex: 0, explanation: "Kontraksi diafragma membuat rongga dada membesar dan membantu udara masuk ke paru-paru." },
    { label: "Pleura", prompt: "Selaput pleura membantu paru-paru dengan…", choices: ["Mengurangi gesekan saat bergerak", "Menyerap sari makanan", "Menghasilkan sel darah merah"], answerIndex: 0, explanation: "Cairan di antara lapisan pleura mengurangi gesekan selama paru-paru mengembang dan mengempis." },
  ],
  circulation: [
    { label: "Serambi kanan", prompt: "Darah dari seluruh tubuh pertama kali masuk ke…", choices: ["Serambi kanan", "Serambi kiri", "Bilik kiri"], answerIndex: 0, explanation: "Vena kava membawa darah miskin oksigen dari tubuh ke serambi kanan." },
    { label: "Bilik kanan", prompt: "Ke mana bilik kanan memompa darah?", choices: ["Ke paru-paru melalui arteri pulmonalis", "Ke seluruh tubuh melalui aorta", "Ke serambi kiri melalui vena kava"], answerIndex: 0, explanation: "Bilik kanan memompa darah menuju paru-paru untuk pertukaran gas." },
    { label: "Vena pulmonalis", prompt: "Pembuluh ini membawa darah dari paru-paru menuju…", choices: ["Serambi kiri", "Serambi kanan", "Bilik kanan"], answerIndex: 0, explanation: "Vena pulmonalis membawa darah kaya oksigen ke serambi kiri." },
    { label: "Aorta", prompt: "Darah dari bilik kiri menuju seluruh tubuh melalui…", choices: ["Aorta", "Vena kava", "Arteri pulmonalis"], answerIndex: 0, explanation: "Aorta adalah arteri utama yang menyalurkan darah kaya oksigen dari bilik kiri." },
    { label: "Kapiler", prompt: "Di pembuluh sangat kecil ini terjadi…", choices: ["Pertukaran zat dengan jaringan", "Pembentukan empedu", "Penyaringan udara"], answerIndex: 0, explanation: "Dinding kapiler yang tipis memungkinkan pertukaran oksigen, nutrisi, dan sisa metabolisme." },
    { label: "Katup jantung", prompt: "Katup jantung memastikan darah…", choices: ["Mengalir satu arah", "Mengalir bolak-balik bebas", "Berubah menjadi udara"], answerIndex: 0, explanation: "Katup membuka dan menutup untuk mencegah aliran balik darah." },
    { label: "Vena kava", prompt: "Vena kava membawa darah dari tubuh menuju…", choices: ["Serambi kanan", "Bilik kiri", "Paru-paru langsung"], answerIndex: 0, explanation: "Vena kava atas dan bawah mengembalikan darah dari tubuh ke serambi kanan." },
    { label: "Arteri pulmonalis", prompt: "Pembuluh ini membawa darah dari bilik kanan ke…", choices: ["Paru-paru", "Seluruh tubuh", "Serambi kiri"], answerIndex: 0, explanation: "Arteri pulmonalis membawa darah dari jantung menuju paru-paru untuk pertukaran gas." },
    { label: "Sel darah merah", prompt: "Protein hemoglobin pada sel ini terutama mengikat…", choices: ["Oksigen", "Empedu", "Pati"], answerIndex: 0, explanation: "Hemoglobin mengikat oksigen di paru-paru dan mengantarkannya ke jaringan tubuh." },
    { label: "Arteri", prompt: "Secara umum, arteri membawa darah…", choices: ["Keluar dari jantung", "Menuju jantung", "Hanya di dalam paru-paru"], answerIndex: 0, explanation: "Arteri membawa darah menjauhi jantung; kandungan oksigennya bergantung pada jenis arteri." },
  ],
  ecosystem: [
    { label: "Padi", prompt: "Padi membuat makanan sendiri melalui fotosintesis. Zona mana yang tepat?", choices: ["Produsen", "Konsumen", "Pengurai"], answerIndex: 0, explanation: "Padi adalah produsen karena mampu membuat bahan organik dengan energi matahari." },
    { label: "Belalang", prompt: "Belalang memakan tumbuhan. Kelompok apa yang tepat?", choices: ["Konsumen tingkat I", "Produsen", "Pengurai"], answerIndex: 0, explanation: "Belalang adalah konsumen tingkat I karena memakan produsen." },
    { label: "Jamur", prompt: "Jamur menguraikan sisa makhluk hidup. Zona mana yang tepat?", choices: ["Pengurai", "Produsen", "Konsumen tingkat I"], answerIndex: 0, explanation: "Jamur mengembalikan unsur hara ke lingkungan dengan menguraikan bahan organik." },
    { label: "Populasi belalang naik", prompt: "Peristiwa acak: belalang bertambah. Dampak awal yang paling mungkin?", choices: ["Padi lebih banyak dimakan; katak mendapat lebih banyak mangsa", "Padi langsung bertambah", "Pengurai berhenti bekerja"], answerIndex: 0, explanation: "Belalang yang meningkat dapat menekan jumlah padi dan menyediakan lebih banyak makanan bagi pemangsanya." , event: true },
    { label: "Populasi elang turun", prompt: "Peristiwa acak: elang berkurang. Apa dampak yang mungkin terjadi pada rantai makanan?", choices: ["Mangsa elang dapat meningkat", "Produsen berubah menjadi pengurai", "Semua konsumen langsung hilang"], answerIndex: 0, explanation: "Berkurangnya predator puncak dapat membuat populasinya mangsa meningkat dan mengubah keseimbangan ekosistem.", event: true },
    { label: "Ulat", prompt: "Ulat memakan daun pada tumbuhan. Kelompok apa yang tepat?", choices: ["Konsumen tingkat I", "Produsen", "Pengurai"], answerIndex: 0, explanation: "Ulat memperoleh energi dengan memakan produsen, sehingga menjadi konsumen tingkat I." },
    { label: "Katak", prompt: "Katak memakan belalang. Peran katak pada rantai ini adalah…", choices: ["Konsumen tingkat II", "Produsen", "Pengurai"], answerIndex: 0, explanation: "Katak memakan konsumen tingkat I, sehingga berperan sebagai konsumen tingkat II." },
    { label: "Bakteri tanah", prompt: "Bakteri menguraikan sisa organisme dan mengembalikan unsur hara. Kelompoknya…", choices: ["Pengurai", "Produsen", "Konsumen tingkat I"], answerIndex: 0, explanation: "Bakteri pengurai membantu mendaur ulang unsur hara dari sisa makhluk hidup." },
    { label: "Elang", prompt: "Dalam rantai padi → belalang → katak → ular → elang, elang berperan sebagai…", choices: ["Konsumen tingkat tinggi", "Produsen", "Pengurai"], answerIndex: 0, explanation: "Elang merupakan predator tingkat tinggi pada contoh rantai makanan tersebut." },
    { label: "Ular sawah", prompt: "Ular memangsa katak dan dapat dimangsa elang. Peran yang sesuai…", choices: ["Konsumen tingkat III", "Produsen", "Pengurai"], answerIndex: 0, explanation: "Dalam rantai tersebut, ular memperoleh energi dari konsumen tingkat II." },
  ],
};

const targetCount = 10;
const laneNames = ["Kiri", "Tengah", "Kanan"];

function shuffleQuestion(term: RushTerm): RushTerm {
  const choices = term.choices.map((choice, index) => ({ choice, correct: index === term.answerIndex }));
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [choices[index], choices[randomIndex]] = [choices[randomIndex], choices[index]];
  }
  return {
    ...term,
    choices: [choices[0].choice, choices[1].choice, choices[2].choice],
    answerIndex: choices.findIndex((choice) => choice.correct),
  };
}

function shuffledTerms(terms: RushTerm[]) {
  const shuffled = [...terms];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function hasDigestiveOrganIllustration(label: string) {
  return ["mulut", "kerongkongan", "lambung", "usus halus", "usus besar", "rektum", "anus", "hati", "pankreas", "kantung empedu"]
    .some((organ) => label.toLowerCase().includes(organ));
}

export function BioRush({ totalXp, onBack, onEarned }: { totalXp: number; onBack: () => void; onEarned: (xp: number) => void }) {
  const { language } = useLanguage();
  const [screen, setScreen] = useState<"select" | "guide" | "playing" | "result">("select");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialId>("cell");
  const [mode, setMode] = useState<"relax" | "challenge">("relax");
  const [lane, setLane] = useState(1);
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const [caughtTerm, setCaughtTerm] = useState<RushTerm | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);
  const [selectedGate, setSelectedGate] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [jumping, setJumping] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [earnedXp, setEarnedXp] = useState(0);
  const [balance, setBalance] = useState(100);
  const questionPanelRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef(1);
  const objectsRef = useRef<FallingObject[]>([]);
  const heldRef = useRef<RushTerm | null>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const correctRef = useRef(0);
  const answeredRef = useRef(0);
  const timeRef = useRef(75);
  const jumpUntilRef = useRef(0);
  const spawnIdRef = useRef(0);
  const spawnIndexRef = useRef(0);
  const questionSequenceRef = useRef<RushTerm[]>([]);
  const endOnceRef = useRef(false);
  const finishRef = useRef<() => void>(() => {});
  const loseLifeRef = useRef<(message: string) => void>(() => {});
  const material = materials.find((item) => item.id === selectedMaterial) ?? materials[0];

  const finishRound = useCallback(() => {
    if (endOnceRef.current) return;
    endOnceRef.current = true;
    const reward = correctRef.current === 0 ? 0 : Math.min(150, Math.max(15, Math.floor(scoreRef.current / 10)));
    setEarnedXp(reward);
    setScreen("result");
    if (reward > 0) onEarned(reward);
  }, [onEarned]);
  finishRef.current = finishRound;

  const loseLife = useCallback((message: string) => {
    if (endOnceRef.current) return;
    const nextLives = Math.max(0, livesRef.current - 1);
    livesRef.current = nextLives;
    setLives(nextLives);
    comboRef.current = 0;
    setCombo(0);
    setBalance((value) => Math.max(0, value - 18));
    setFeedback(message);
    if (nextLives === 0) finishRef.current();
  }, []);
  loseLifeRef.current = loseLife;

  const moveLane = useCallback((direction: number) => {
    if (heldRef.current) {
      setSelectedGate((current) => (current + direction + 3) % 3);
      return;
    }
    const nextLane = Math.max(0, Math.min(2, laneRef.current + direction));
    laneRef.current = nextLane;
    setLane(nextLane);
  }, []);

  const jump = useCallback(() => {
    jumpUntilRef.current = Date.now() + 650;
    setJumping(true);
    window.setTimeout(() => setJumping(false), 650);
  }, []);

  const catchOrDrop = useCallback(() => {
    if (heldRef.current) {
      heldRef.current = null;
      setCaughtTerm(null);
      setCombo(0);
      comboRef.current = 0;
      setFeedback("Kartu dilepas. Tangkap kartu lain untuk melanjutkan ronde.");
      return;
    }
    const target = objectsRef.current
      .filter((object) => object.kind === "term" && object.lane === laneRef.current && object.y >= 58 && object.y <= 94)
      .sort((a, b) => b.y - a.y)[0];
    if (!target?.term) {
      setFeedback("Pindah ke jalur kartu dan tekan Tangkap saat kartu mendekati garis bawah.");
      return;
    }
    objectsRef.current = objectsRef.current.filter((object) => object.id !== target.id);
    setObjects(objectsRef.current);
    heldRef.current = target.term;
    setCaughtTerm(target.term);
    setSelectedGate(0);
    setFeedback("");
  }, []);

  const submitGate = useCallback((gateIndex = selectedGate) => {
    const term = heldRef.current;
    if (!term) {
      setFeedback("Tangkap bola atau kartu istilah terlebih dahulu.");
      return;
    }
    answeredRef.current += 1;
    setAnsweredCount(answeredRef.current);
    heldRef.current = null;
    setCaughtTerm(null);
    if (gateIndex === term.answerIndex) {
      const nextCombo = comboRef.current + 1;
      const gained = 100 + Math.min(100, comboRef.current * 15);
      comboRef.current = nextCombo;
      scoreRef.current += gained;
      correctRef.current += 1;
      setCombo(nextCombo);
      setBestCombo((best) => Math.max(best, nextCombo));
      setScore(scoreRef.current);
      setCorrectCount(correctRef.current);
      setBalance((value) => Math.min(100, value + 4));
      setFeedback("");
      setPendingFeedback({ correct: true, text: term.explanation, points: gained, answerText: term.choices[term.answerIndex] });
    } else {
      setFeedback("");
      setPendingFeedback({ correct: false, text: term.explanation, points: 0, answerText: term.choices[term.answerIndex] });
    }
  }, [selectedGate]);

  function continueAfterAnswer() {
    if (!pendingFeedback) return;
    const result = pendingFeedback;
    setPendingFeedback(null);
    if (!result.correct) {
      comboRef.current = 0;
      setCombo(0);
      const nextLives = Math.max(0, livesRef.current - 1);
      livesRef.current = nextLives;
      setLives(nextLives);
      setBalance((value) => Math.max(0, value - 15));
      if (nextLives === 0 || answeredRef.current >= targetCount) finishRef.current();
      return;
    }
    if (answeredRef.current >= targetCount) finishRef.current();
  }

  function startRound() {
    endOnceRef.current = false;
    laneRef.current = 1;
    objectsRef.current = [];
    heldRef.current = null;
    scoreRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 0;
    correctRef.current = 0;
    answeredRef.current = 0;
    timeRef.current = 75;
    jumpUntilRef.current = 0;
    spawnIdRef.current = 0;
    spawnIndexRef.current = 0;
    questionSequenceRef.current = shuffledTerms(questionBank[selectedMaterial]);
    setLane(1);
    setObjects([]);
    setCaughtTerm(null);
    setPendingFeedback(null);
    setSelectedGate(0);
    setScore(0);
    setLives(3);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setTimeLeft(75);
    setJumping(false);
    setFeedback("");
    setBalance(100);
    setEarnedXp(0);
    setScreen("playing");
  }

  useEffect(() => {
    if (screen !== "playing" || pendingFeedback || caughtTerm) return;
    let sinceSpawn = 0;
    let clockMs = 0;
    const simulation = window.setInterval(() => {
      sinceSpawn += 60;
      clockMs += 60;
      let collided = false;
      const moved = objectsRef.current.flatMap((object) => {
        const nextY = object.y + 1.65;
        if (nextY >= 96) {
          if (object.kind === "obstacle" && object.lane === laneRef.current && Date.now() > jumpUntilRef.current) collided = true;
          return [];
        }
        return [{ ...object, y: nextY }];
      });
      if (sinceSpawn >= 1120 && !heldRef.current) {
        sinceSpawn = 0;
        const obstacle = Math.random() < 0.24;
        const term = shuffleQuestion(questionSequenceRef.current[spawnIndexRef.current] ?? questionBank[selectedMaterial][0]);
        moved.push({
          id: ++spawnIdRef.current,
          kind: obstacle ? "obstacle" : "term",
          lane: Math.floor(Math.random() * 3),
          y: 0,
          term: obstacle ? undefined : term,
        });
        if (!obstacle) spawnIndexRef.current += 1;
      }
      objectsRef.current = moved;
      setObjects(moved);
      if (collided) loseLifeRef.current("Rintangan! Pindah jalur atau lompat dengan tombol panah atas.");
      if (clockMs >= 1000) {
        clockMs = 0;
        if (mode === "challenge") {
          timeRef.current = Math.max(0, timeRef.current - 1);
          setTimeLeft(timeRef.current);
          if (timeRef.current === 0) finishRef.current();
        }
      }
    }, 60);
    return () => window.clearInterval(simulation);
  }, [caughtTerm, mode, pendingFeedback, screen, selectedMaterial]);

  useEffect(() => {
    if (!caughtTerm) return;
    const scrollTimer = window.setTimeout(() => {
      questionPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(scrollTimer);
  }, [caughtTerm]);

  useEffect(() => {
    if (screen !== "playing") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (pendingFeedback) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Enter"].includes(event.key)) event.preventDefault();
      if (event.key === "ArrowLeft") moveLane(-1);
      if (event.key === "ArrowRight") moveLane(1);
      if (event.key === "ArrowUp") jump();
      if (event.code === "Space") catchOrDrop();
      if (event.key === "Enter") submitGate();
      if (heldRef.current && event.key === "1") setSelectedGate(0);
      if (heldRef.current && event.key === "2") setSelectedGate(1);
      if (heldRef.current && event.key === "3") setSelectedGate(2);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, pendingFeedback, moveLane, jump, catchOrDrop, submitGate]);

  const resetSelection = () => {
    setCaughtTerm(null);
    heldRef.current = null;
    setScreen("select");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 animate-in fade-in duration-300">
      <button type="button" onClick={screen === "playing" ? finishRound : onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-sage-800 hover:bg-sage-100 dark:text-[#dce9c9] dark:hover:bg-[#263d2d]"><ArrowLeft className="h-4 w-4" /> {screen === "playing" ? "Akhiri ronde" : "Kembali ke Ruang Santai"}</button>
      <section className="overflow-hidden rounded-3xl border border-sage-200 bg-white/90 shadow-sm dark:border-[#304636] dark:bg-[#192b20]">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#315f3d] via-[#397448] to-[#557f42] px-5 py-5 text-white dark:from-[#203e2b] dark:via-[#294d33] dark:to-[#344d32] md:px-7">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Zap className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#dce9ae]">{translate("Arena biologi · kelas 10", language)}</p><h1 className="text-xl font-black md:text-2xl">{translate("Bio Rush: Arena Biologi", language)}</h1></div></div>
          <p className="rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-sm font-semibold"><Zap className="mr-1 inline h-4 w-4 text-[#e4edaa]" />{totalXp} XP</p>
        </header>

        {screen === "select" ? (
          <div className="p-5 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sage-700 dark:text-[#b8d596]">{translate("Pilih materi", language)}</p><h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">{translate("Pilih arena biologimu", language)}</h2><p className="mt-1 text-sm text-slate-600 dark:text-[#b9c7b4]">{translate("Enam topik · 10 kartu per ronde", language)}</p></div>
              <div className="inline-flex rounded-xl border border-sage-200 bg-[#f3f7ed] p-1 dark:border-[#405747] dark:bg-[#203328]" aria-label="Mode permainan">
                <button type="button" onClick={() => setMode("relax")} aria-pressed={mode === "relax"} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${mode === "relax" ? "bg-white text-sage-900 shadow-sm dark:bg-[#38533a] dark:text-white" : "text-slate-600 dark:text-[#c7d3c1]"}`}>{translate("Santai", language)}</button>
                <button type="button" onClick={() => setMode("challenge")} aria-pressed={mode === "challenge"} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${mode === "challenge" ? "bg-white text-sage-900 shadow-sm dark:bg-[#38533a] dark:text-white" : "text-slate-600 dark:text-[#c7d3c1]"}`}>{translate("Tantangan · 75 dtk", language)}</button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {materials.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelectedMaterial(item.id)} aria-pressed={selectedMaterial === item.id} className={`group flex min-h-28 items-center gap-4 rounded-2xl border bg-gradient-to-br p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${item.color} ${selectedMaterial === item.id ? "border-[#65934d] ring-2 ring-[#a6c682] shadow-md" : "border-sage-200 dark:border-[#405747]"}`}>
                  <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-white/75 shadow-sm dark:bg-black/15"><BioArtwork materialId={item.id} label={questionBank[item.id][0].label} size="card" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-black text-slate-900 dark:text-[#edf4e2]">{translate(item.title, language)}</span><span className="mt-1 block text-xs text-slate-600 dark:text-[#c7d3c1]">{translate(item.short, language)}</span></span>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black ${selectedMaterial === item.id ? "bg-[#4e7d39] text-white" : "bg-white/70 text-slate-400 dark:bg-black/15"}`}>{selectedMaterial === item.id ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d7e5c7] bg-[#f3f7ed] p-4 dark:border-[#405a46] dark:bg-[#263d2d]">
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#203328]"><BioArtwork materialId={material.id} label={questionBank[material.id][0].label} size="small" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-sage-700 dark:text-[#b8d596]">{translate("Arena dipilih", language)}</p><p className="truncate font-black text-slate-900 dark:text-[#edf4e2]">{translate(material.title, language)}</p></div></div>
              <button type="button" onClick={() => setScreen("guide")} className="btn-primary inline-flex items-center gap-2"><Gamepad2 className="h-4 w-4" /> {translate("Lanjut", language)}</button>
            </div>
          </div>
        ) : null}

        {screen === "guide" ? (
          <div className="mx-auto max-w-3xl p-5 md:p-8">
            <button type="button" onClick={() => setScreen("select")} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-sage-700 dark:text-[#dce9c9]"><ArrowLeft className="h-4 w-4" /> {translate("Ganti materi", language)}</button>
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#315f3d] to-[#557f42] p-5 text-white dark:from-[#203e2b] dark:to-[#344d32]"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15"><BioArtwork materialId={material.id} label={questionBank[material.id][0].label} size="large" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#e4edaa]">{translate("Sebelum mulai", language)}</p><h2 className="mt-1 text-xl font-black">{translate(material.title, language)}</h2><p className="mt-1 text-sm text-white/80">10 {translate("kartu", language)} · 3 {translate("Nyawa", language).toLowerCase()} · {mode === "challenge" ? (language === "en" ? "75 sec" : "75 detik") : translate("Santai · tanpa timer", language)}</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <GuideCard title={translate("1. Lari", language)} detail={translate("Kiri/kanan untuk pindah jalur, ↑ untuk melompat.", language)} />
              <GuideCard title={translate("2. Tangkap", language)} detail={translate("Dekati kartu, lalu tekan Spasi atau tombol Tangkap.", language)} />
              <GuideCard title={translate("3. Jawab", language)} detail={translate("Pilih gerbang yang tepat. Salah mengurangi satu nyawa.", language)} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-sage-200 bg-[#f3f7ed] p-4 dark:border-[#405747] dark:bg-[#263d2d]"><p className="text-sm text-slate-600 dark:text-[#c7d3c1]">{translate("Kontrol tersedia di layar selama ronde.", language)}</p><button type="button" onClick={startRound} className="btn-primary inline-flex shrink-0 items-center gap-2"><Sparkles className="h-4 w-4" /> {translate("Mulai ronde", language)}</button></div>
          </div>
        ) : null}

        {screen === "playing" ? (
          <div className="p-4 md:p-6">
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Skor" value={score.toLocaleString("id-ID")} />
              <Stat label="Waktu" value={mode === "challenge" ? `${timeLeft} ${language === "en" ? "sec" : "dtk"}` : translate("Santai", language)} icon={<Clock3 className="h-4 w-4" />} />
              <Stat label="Soal" value={`${answeredCount}/${targetCount}`} />
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-[#684443] dark:bg-[#382a29]"><span className="text-xs font-semibold text-slate-500 dark:text-[#c7b5b2]">{translate("Nyawa", language)}</span><div className="mt-1 flex gap-1">{[0, 1, 2].map((heart) => <Heart key={heart} className={`h-4 w-4 ${heart < lives ? "fill-rose-400 text-rose-500" : "text-slate-300 dark:text-slate-600"}`} />)}<span className="ml-1 text-xs font-bold text-slate-600 dark:text-[#d8c6c3]">· ×{combo}</span></div></div>
            </div>

            <div className="relative h-[390px] overflow-hidden rounded-3xl border border-[#526947] bg-[radial-gradient(ellipse_at_50%_100%,#42664c_0%,#233c31_45%,#172820_100%)] shadow-inner sm:h-[460px]">
              <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(220,233,174,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(220,233,174,.08) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111c17]/90 to-transparent" />
              {[1, 2].map((division) => <span key={division} className="pointer-events-none absolute inset-y-0 border-l border-dashed border-white/20" style={{ left: `${(division / 3) * 100}%` }} />)}
              <div className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-bold text-[#e6efc7]">{translate(material.title, language)}</div>
              <div className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-bold text-[#e6efc7]"><Target className="mr-1 inline h-3.5 w-3.5" />{translate("Runtun", language)} ×{combo}</div>
              {objects.map((object) => (
                <div key={object.id} aria-label={object.kind === "obstacle" ? "Rintangan" : object.term?.label} className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-none ${object.kind === "obstacle" ? "h-11 w-11 rotate-45 rounded-xl border-2 border-orange-100 bg-gradient-to-br from-orange-400 to-red-600 shadow-lg shadow-orange-950/40" : "h-[92px] w-[98px] flex-col gap-0.5 rounded-2xl border border-[#e3ecc5]/90 bg-gradient-to-br from-white via-[#f1f4d8] to-[#bfd19a] px-1.5 py-1 shadow-xl shadow-black/35 sm:h-[100px] sm:w-[112px] sm:gap-1"}`} style={{ left: `${(object.lane + 0.5) * (100 / 3)}%`, top: `${object.y}%` }}>
                  {object.kind === "obstacle" ? <span className="-rotate-45 text-lg font-black text-white">!</span> : object.term ? <><BioArtwork materialId={selectedMaterial} label={object.term.label} size="arena" /><span className="max-w-full truncate text-center text-[9px] font-black leading-tight text-[#263c2c] sm:text-[10px]">{object.term.label}</span></> : null}
                </div>
              ))}
              <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-[#d5e7a4]/80" style={{ top: "82%" }}><span className="absolute right-2 -top-5 rounded-full bg-[#1c3026]/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e6efc7]">Zona tangkap</span></div>
              <div className={`absolute z-20 flex h-[76px] w-[60px] -translate-x-1/2 items-center justify-center transition-all duration-200 ${jumping ? "-translate-y-12 scale-110" : ""}`} style={{ left: `${(lane + 0.5) * (100 / 3)}%`, bottom: "6%" }} aria-label={`Pemain di jalur ${laneNames[lane]}`}><RunnerCharacter /></div>
              <div className="absolute inset-x-2 bottom-2 grid grid-cols-3 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-white/60"><span>Jalur kiri</span><span>Jalur tengah</span><span>Jalur kanan</span></div>
            </div>

            {caughtTerm ? (
              <div ref={questionPanelRef} className="mt-4 scroll-mt-24 rounded-2xl border border-[#bfd39b] bg-[#f4f7e9] p-4 shadow-md dark:border-[#4f6940] dark:bg-[#29392b]">
                <div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-[#203328]"><BioArtwork materialId={selectedMaterial} label={caughtTerm.label} size="large" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-[#b8d596]">Kartu tertangkap · arena dijeda</p><p className="mt-1 font-black text-slate-900 dark:text-[#edf4e2]">{caughtTerm.label}</p></div></div>
                <p className="mt-3 text-base font-bold text-slate-900 dark:text-[#edf4e2]">{caughtTerm.prompt}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">{caughtTerm.choices.map((choice, index) => <button key={choice} type="button" aria-pressed={selectedGate === index} onClick={() => setSelectedGate(index)} className={`min-h-16 rounded-xl border px-3 py-2 text-left text-sm font-bold leading-snug transition ${selectedGate === index ? "border-[#618448] bg-[#dce9c7] text-[#29432f] ring-2 ring-[#9fbd7c] dark:border-[#86a96c] dark:bg-[#354c32] dark:text-[#eff6dc]" : "border-sage-200 bg-white text-slate-700 hover:bg-[#f1f5e9] dark:border-[#405747] dark:bg-[#203328] dark:text-[#d9e7d6]"}`}><span className="mb-1 block text-[10px] font-black tracking-wide opacity-60">GERBANG {index + 1}</span><span className="flex items-center gap-2">{selectedMaterial === "digestion" && hasDigestiveOrganIllustration(choice) ? <DigestiveArtwork label={choice} /> : null}<span>{choice}</span></span></button>)}</div>
                <button type="button" onClick={() => submitGate()} className="btn-primary mt-3 inline-flex w-full items-center justify-center gap-2"><ArrowRight className="h-4 w-4" /> Jawab · Enter</button>
              </div>
            ) : pendingFeedback ? (
              <div ref={questionPanelRef} className={`mt-4 scroll-mt-24 rounded-2xl border p-4 shadow-sm ${pendingFeedback.correct ? "border-emerald-300 bg-emerald-50 dark:border-[#53744a] dark:bg-[#263e2c]" : "border-rose-300 bg-rose-50 dark:border-[#80504a] dark:bg-[#402b2a]"}`} role="status" aria-live="polite">
                <div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pendingFeedback.correct ? "bg-emerald-200 text-emerald-800 dark:bg-[#395a39] dark:text-[#d5e5bd]" : "bg-rose-200 text-rose-800 dark:bg-[#5a3734] dark:text-[#f4c8bb]"}`}>{pendingFeedback.correct ? <Check className="h-6 w-6" /> : <Heart className="h-6 w-6" />}</span><div><p className={`text-lg font-black ${pendingFeedback.correct ? "text-emerald-900 dark:text-[#d5e5bd]" : "text-rose-900 dark:text-[#f4c8bb]"}`}>{pendingFeedback.correct ? `BENAR · +${pendingFeedback.points} poin` : "BELUM TEPAT"}</p><p className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-[#edf4e2]">Jawaban tepat: {selectedMaterial === "digestion" && hasDigestiveOrganIllustration(pendingFeedback.answerText) ? <DigestiveArtwork label={pendingFeedback.answerText} /> : null}{pendingFeedback.answerText}</p></div></div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-[#d9e7d6]">{pendingFeedback.text}</p>
                {!pendingFeedback.correct ? <p className="mt-2 text-xs font-bold text-rose-800 dark:text-[#f2b9aa]">Satu nyawa berkurang setelah melanjutkan.</p> : null}
                <button type="button" onClick={continueAfterAnswer} className="btn-primary mt-3 inline-flex items-center gap-2">Lanjutkan ronde <ArrowRight className="h-4 w-4" /></button>
              </div>
            ) : feedback ? <p className="mt-3 rounded-xl bg-[#f2f5e9] px-4 py-3 text-sm leading-relaxed text-slate-700 dark:bg-[#26392c] dark:text-[#d9e7d6]">{feedback}</p> : null}

            {!pendingFeedback ? <div className="mt-4 rounded-2xl border border-sage-200 bg-[#f3f7ed] p-3 dark:border-[#405747] dark:bg-[#203328]">
              <div className="mb-2 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-[#d9e7d6]">{translate("Kontrol arena", language)}</p><p className="text-[11px] text-slate-500 dark:text-[#aab9a7]">{language === "en" ? "← → move · ↑ jump · Space catch" : "← → pindah · ↑ lompat · Spasi tangkap"}</p></div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                <ControlButton label={translate("Kiri", language)} onClick={() => moveLane(-1)}><ArrowLeft className="h-5 w-5" /></ControlButton>
                <ControlButton label={translate("Lompat", language)} onClick={jump}><ArrowUp className="h-5 w-5" /></ControlButton>
                <ControlButton label={translate(caughtTerm ? "Lepas" : "Tangkap", language)} onClick={catchOrDrop}><Leaf className="h-5 w-5" /></ControlButton>
                <ControlButton label={translate("Kanan", language)} onClick={() => moveLane(1)}><ArrowRight className="h-5 w-5" /></ControlButton>
                {caughtTerm ? <button type="button" onClick={() => submitGate()} className="col-span-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#315f3d] px-4 font-black text-white shadow-sm transition hover:bg-[#274f33] sm:col-span-1"><Target className="h-4 w-4" /> {translate("Jawab", language)}</button> : <div className="hidden items-center justify-center rounded-xl bg-[#e7eee0] text-xs font-bold text-slate-500 dark:bg-[#26392c] dark:text-[#aab9a7] sm:flex"><PersonStanding className="mr-1 h-4 w-4" />{language === "en" ? "Run" : "Bertahan"}</div>}
              </div>
            </div> : null}
          </div>
        ) : null}

        {screen === "result" ? (
          <div className="relative isolate overflow-hidden p-7 text-center md:p-10">
            <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#78955c] opacity-[0.08]"><span className="text-[220px]">✦</span></div>
            <div className="relative z-10 mx-auto max-w-2xl"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f2d9] text-sage-700 dark:bg-[#294332] dark:text-[#dce9ae]"><Trophy className="h-8 w-8" /></span><p className="mt-4 text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-[#b8d596]">Hasil ronde · {material.title}</p><h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-[#edf4e2]">{answeredCount >= targetCount ? "Sepuluh soal selesai!" : "Ronde selesai"}</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><ResultStat label="Skor" value={score.toLocaleString("id-ID")} /><ResultStat label="Benar" value={`${correctCount}/${answeredCount}`} /><ResultStat label="Runtun terbaik" value={`×${bestCombo}`} /><ResultStat label="XP didapat" value={`+${earnedXp}`} /></div><div className="mt-4 rounded-2xl border border-sage-200 bg-[#f5f8f0] p-4 dark:border-[#405747] dark:bg-[#263d2d]"><p className="font-bold text-slate-800 dark:text-[#edf4e2]">{badgeFor(correctCount, bestCombo)}</p><p className="mt-1 text-sm text-slate-600 dark:text-[#c7d3c1]">{answeredCount >= targetCount ? "Sepuluh soal sudah dijawab. Pilih materi lain atau coba mode berbeda." : "Setiap jawaban benar memberi +100 poin, ditambah bonus jawaban beruntun. XP hanya membuka permainan di Ruang Santai."}</p></div><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={startRound} className="btn-primary inline-flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Main ulang</button><button type="button" onClick={resetSelection} className="rounded-xl border border-sage-300 px-4 py-2.5 font-bold text-sage-800 hover:bg-sage-50 dark:border-[#526c55] dark:text-[#dce9c9]">Pilih materi lain</button><button type="button" onClick={onBack} className="rounded-xl border border-sage-300 px-4 py-2.5 font-bold text-sage-800 hover:bg-sage-50 dark:border-[#526c55] dark:text-[#dce9c9]">Kembali ke Ruang Santai</button></div></div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function GuideCard({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-2xl border border-sage-200 bg-[#f5f8f0] p-4 dark:border-[#405747] dark:bg-[#263d2d]"><p className="font-bold text-slate-900 dark:text-[#edf4e2]">{title}</p><p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#c7d3c1]">{detail}</p></div>;
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  const { language } = useLanguage();
  return <div className="rounded-xl border border-sage-200 bg-[#f5f8f0] p-3 dark:border-[#405747] dark:bg-[#263d2d]"><span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-[#aab9a7]">{icon}{translate(label, language)}</span><strong className="mt-1 block text-lg font-black text-slate-900 dark:text-[#edf4e2]">{value}</strong></div>;
}

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  const { language } = useLanguage();
  return <button type="button" onClick={onClick} className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl border border-sage-200 bg-white text-sage-800 shadow-sm active:scale-95 dark:border-[#405747] dark:bg-[#263d2d] dark:text-[#dce9c9]">{children}<span className="text-[10px] font-bold">{translate(label, language)}</span></button>;
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-sage-200 bg-white p-3 dark:border-[#405747] dark:bg-[#203328]"><p className="text-xs text-slate-500 dark:text-[#aab9a7]">{label}</p><p className="mt-1 text-xl font-black text-slate-900 dark:text-[#edf4e2]">{value}</p></div>;
}

function badgeFor(correct: number, bestCombo: number) {
  if (correct >= 10 && bestCombo >= 8) return "Lencana: Ahli Arena";
  if (correct >= 8) return "Lencana: Penjelajah Biologi";
  if (correct >= 4) return "Lencana: Pelari Tangguh";
  return "Lencana: Pemula Arena";
}

function BioArtwork({ materialId, label, size = "small" }: { materialId: MaterialId; label: string; size?: "small" | "card" | "large" | "arena" }) {
  const name = label.toLowerCase();
  if (materialId === "digestion") return <DigestiveArtwork label={label} size={size === "large" ? "large" : "small"} />;

  let image: React.ReactNode;
  if (materialId === "cell") {
    if (name.includes("mitokondria")) image = <><path d="M12 43C7 31 17 18 32 17c10-1 17 6 25 5 13-1 18 10 11 21-8 14-23 16-34 10-9-5-17-2-22-10Z" fill="#dd8064" stroke="#8d493b" strokeWidth="3"/><path d="M20 29c6 5 11-5 17 0s10-5 16 0m-34 9c6 5 11-5 17 0s10-5 16 0m-28 9c5 4 10-4 15 0" fill="none" stroke="#f8d4a7" strokeWidth="3.5" strokeLinecap="round"/></>;
    else if (name.includes("nukleus")) image = <><circle cx="40" cy="40" r="27" fill="#7d85c9" stroke="#454a89" strokeWidth="4"/><circle cx="40" cy="40" r="18" fill="#a8addf"/><circle cx="48" cy="32" r="6" fill="#5d4b84"/><path d="M25 43c7-14 15 14 28-4M23 52c8-7 11 2 17-4" fill="none" stroke="#f0d8b3" strokeWidth="2.5" strokeLinecap="round"/></>;
    else if (name.includes("ribosom")) image = <><ellipse cx="40" cy="30" rx="19" ry="12" fill="#d99d57" stroke="#855b32" strokeWidth="3"/><ellipse cx="40" cy="50" rx="24" ry="15" fill="#f0c77e" stroke="#a6783e" strokeWidth="3"/><circle cx="30" cy="49" r="2" fill="#785735"/><circle cx="42" cy="54" r="2" fill="#785735"/><circle cx="51" cy="47" r="2" fill="#785735"/></>;
    else if (name.includes("membran")) image = <><path d="M13 27h54M13 54h54" stroke="#4f8793" strokeWidth="5"/><path d="M18 20v14m12-14v14m12-14v14m12-14v14m12-14v14M18 47v14m12-14v14m12-14v14m12-14v14m12-14v14" stroke="#e1a26f" strokeWidth="5" strokeLinecap="round"/><path d="M14 40h52" stroke="#d6e4b6" strokeWidth="4" strokeDasharray="3 4"/></>;
    else if (name.includes("kloroplas")) image = <><ellipse cx="40" cy="40" rx="30" ry="21" fill="#78a957" stroke="#476b3b" strokeWidth="4"/><ellipse cx="40" cy="40" rx="24" ry="15" fill="#b5ce72"/><path d="M22 31h16m4 0h16M22 38h16m4 0h16M22 45h16m4 0h16M22 52h16m4 0h16" stroke="#47704a" strokeWidth="3.5" strokeLinecap="round"/></>;
    else if (name.includes("golgi")) image = <><path d="M20 24c13-8 28-8 41 0M16 33c16-7 32-7 48 0M14 42c18-6 34-6 52 0M17 51c15-4 31-4 46 0M23 60c12-3 24-3 36 0" fill="none" stroke="#cf7f65" strokeWidth="6" strokeLinecap="round"/><circle cx="63" cy="19" r="4" fill="#e9bd78"/><circle cx="13" cy="59" r="4" fill="#e9bd78"/></>;
    else if (name.includes("retikulum")) image = <><path d="M18 24c13 8 3 14 16 20s3 13 17 19M58 22c-13 8-3 14-16 20s-3 13-17 19" fill="none" stroke="#7098ac" strokeWidth="6" strokeLinecap="round"/><path d="M19 30h12m10 7h14M21 49h12m12 7h14" stroke="#dba56d" strokeWidth="3.5" strokeLinecap="round"/><circle cx="28" cy="29" r="2.5" fill="#684d46"/><circle cx="53" cy="46" r="2.5" fill="#684d46"/></>;
    else if (name.includes("dinding sel")) image = <><rect x="16" y="16" width="48" height="48" rx="7" fill="#a5c978" stroke="#54743e" strokeWidth="7"/><rect x="25" y="25" width="30" height="30" rx="5" fill="#e6d99c" stroke="#739657" strokeWidth="3"/><circle cx="40" cy="40" r="7" fill="#8790c9"/></>;
    else if (name.includes("vakuola") || name.includes("lisosom")) image = <><circle cx="40" cy="40" r="26" fill={name.includes("vakuola") ? "#91c8d2" : "#e8b85d"} stroke={name.includes("vakuola") ? "#477c8a" : "#986d32"} strokeWidth="4"/><circle cx="32" cy="33" r="5" fill="#fff" opacity=".55"/><circle cx="51" cy="47" r="3" fill="#f8e9c8"/><circle cx="31" cy="50" r="2.5" fill="#f8e9c8"/></>;
    else image = <><path d="M17 20h46v40H17z" fill="#d8e6c4" stroke="#688250" strokeWidth="4"/><circle cx="40" cy="40" r="12" fill="#8790c9"/><path d="M40 28v24m-12-12h24" stroke="#e9c780" strokeWidth="3"/></>;
  } else if (materialId === "plant") {
    if (name.includes("xilem") || name.includes("air dari") || name.includes("mineral") || name.includes("pembuluh kayu")) image = <><path d="M30 13h20v54H30z" fill="#c58b53" stroke="#795633" strokeWidth="4"/><path d="M32 22c16 4 0 8 16 12s0 8 16 12M32 48c16 4 0 8 16 12" fill="none" stroke="#f1d18d" strokeWidth="4"/><path d="M40 58V19m-6 8 6-8 6 8" fill="none" stroke="#3d8e9b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></>;
    else if (name.includes("floem") || name.includes("gula") || name.includes("fotosintesis") || name.includes("tabung tapis")) image = <><rect x="28" y="14" width="24" height="52" rx="10" fill="#9dbb68" stroke="#627e44" strokeWidth="4"/><path d="M29 31h22m-22 18h22" stroke="#f3e2ab" strokeWidth="4" strokeDasharray="3 3"/><circle cx="39" cy="25" r="4" fill="#d6a555"/><circle cx="45" cy="42" r="4" fill="#d6a555"/><circle cx="37" cy="57" r="4" fill="#d6a555"/><path d="M40 62V20m-6 8 6-8 6 8" fill="none" stroke="#a66c39" strokeWidth="3"/></>;
    else if (name.includes("stomata")) image = <><path d="M35 18c-14 6-18 23-10 35 4 6 10 8 15 4V24c0-5-2-7-5-6Zm10 0c14 6 18 23 10 35-4 6-10 8-15 4V24c0-5 2-7 5-6Z" fill="#79a86b" stroke="#436a49" strokeWidth="4"/><path d="M40 27v26" stroke="#f5edcf" strokeWidth="4" strokeDasharray="3 3"/></>;
    else if (name.includes("epidermis")) image = <><path d="M17 19h21v20H17zm25 0h21v20H42zM17 43h21v20H17zm25 0h21v20H42z" fill="#a5c979" stroke="#54743e" strokeWidth="3"/><circle cx="28" cy="29" r="3" fill="#e4dca8"/><circle cx="53" cy="53" r="3" fill="#e4dca8"/></>;
    else image = <><path d="M40 65V27m0 19C19 47 17 31 18 24c18-2 25 7 22 22Zm0-8c5-15 19-19 28-16 0 18-11 24-28 25Z" fill="#83aa5c" stroke="#4c723e" strokeWidth="3" strokeLinejoin="round"/><path d="M40 64V32m0 14 15-13" stroke="#e5d59c" strokeWidth="3"/></>;
  } else if (materialId === "respiration") {
    if (name.includes("alveolus")) image = <><path d="M40 18v20m0 0-14 10m14-10 14 10" stroke="#9a5a51" strokeWidth="5" strokeLinecap="round"/><circle cx="24" cy="52" r="12" fill="#e7a08b" stroke="#a85c55" strokeWidth="3"/><circle cx="56" cy="52" r="12" fill="#e7a08b" stroke="#a85c55" strokeWidth="3"/><circle cx="20" cy="49" r="3" fill="#f8d7c5"/><circle cx="52" cy="49" r="3" fill="#f8d7c5"/><path d="M14 68c8-7 15 7 23 0s15 7 29 0" fill="none" stroke="#b24f4f" strokeWidth="3"/></>;
    else if (name.includes("diafragma")) image = <><path d="M14 50c14-2 19-15 26-15s12 13 26 15" fill="none" stroke="#c97664" strokeWidth="9" strokeLinecap="round"/><path d="M16 59c14 0 18-9 24-9s10 9 24 9" fill="none" stroke="#e8b0a0" strokeWidth="4"/></>;
    else if (name.includes("hidung")) image = <><path d="M43 15c-1 12-4 24-13 34-5 6-1 12 8 12h14c8 0 11-8 5-13l-8-6" fill="#e5a18c" stroke="#a65d58" strokeWidth="4" strokeLinejoin="round"/><path d="M34 53c4-3 8-2 11 0" fill="none" stroke="#814b4b" strokeWidth="3" strokeLinecap="round"/><circle cx="49" cy="35" r="3" fill="#f6cfbd"/></>;
    else image = <><path d="M37 14h6v20l-4 8v8c-14-12-27-4-27 12 0 11 9 16 20 12 8-3 10-13 10-22 0-5 3-7 7-10V34c0-6-4-8-6-11" fill="#e98f82" stroke="#a95050" strokeWidth="4" strokeLinejoin="round"/><path d="M40 36v9m0 0-12 11m12-11 12 11" stroke="#f5d7b8" strokeWidth="4" strokeLinecap="round"/><path d="M37 18h6m-6 7h6m-6 7h6" stroke="#f5d7b8" strokeWidth="2.5"/></>;
  } else if (materialId === "circulation") {
    if (name.includes("sel darah merah")) image = <><ellipse cx="40" cy="41" rx="29" ry="21" fill="#c74f4d" stroke="#843c40" strokeWidth="4"/><ellipse cx="40" cy="41" rx="15" ry="9" fill="#ed9690" stroke="#a84b4b" strokeWidth="3"/><ellipse cx="33" cy="35" rx="6" ry="3" fill="#ffd1ba" opacity=".8"/></>;
    else if (name.includes("arteri") || name.includes("vena") || name.includes("kapiler") || name.includes("aorta")) image = <><path d="M18 64V16h18v48m8 0V16h18v48" fill="#d88070" stroke="#86494d" strokeWidth="4"/><path d="M27 58V24m26 34V24" stroke="#f7c3a8" strokeWidth="4" strokeLinecap="round"/><path d="m31 28-4-6-4 6m30 24 4 6 4-6" fill="none" stroke="#fff0d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></>;
    else image = <><path d="M40 66 18 45C3 30 15 13 29 19c5 2 8 7 11 11 3-4 6-9 11-11 14-6 26 11 11 26L40 66Z" fill="#c94d51" stroke="#823b43" strokeWidth="4" strokeLinejoin="round"/><path d="M29 19c-2-7 0-11 4-14m11 14c2-8 6-10 10-12" fill="none" stroke="#d98770" strokeWidth="5" strokeLinecap="round"/><path d="M24 34c0-5 5-7 9-4" fill="none" stroke="#f6b5a4" strokeWidth="3" strokeLinecap="round"/></>;
  } else {
    if (name.includes("padi")) image = <><path d="M39 68V26m0 26C28 41 21 44 17 48m22-11c10-13 18-14 24-14" stroke="#63854a" strokeWidth="4" strokeLinecap="round"/><path d="M63 23c-6 3-9 8-9 14m-4-11c-7 2-10 7-10 13m-16 8c7 0 12 4 14 9" fill="none" stroke="#d4b85f" strokeWidth="6" strokeLinecap="round"/><path d="M31 68h18" stroke="#76573c" strokeWidth="4" strokeLinecap="round"/></>;
    else if (name.includes("belalang") || name.includes("ulat") || name.includes("serangga")) image = <><ellipse cx="41" cy="39" rx="9" ry="15" fill="#8ca84e" stroke="#52693b" strokeWidth="3"/><circle cx="41" cy="20" r="7" fill="#8ca84e" stroke="#52693b" strokeWidth="3"/><path d="M35 48 24 61m12-10-2 15m14-18 12 10m-9-17 13-13M38 15l-7-9m14 9 7-9" fill="none" stroke="#52693b" strokeWidth="3.5" strokeLinecap="round"/><path d="M31 33c-9-12-19-5-12 5 4 5 9 7 15 6m14-11c9-12 19-5 12 5-4 5-9 7-15 6" fill="#b6cd79" stroke="#718a46" strokeWidth="2.5"/></>;
    else if (name.includes("jamur") || name.includes("bakteri")) image = <><path d="M37 42h8v23h-8z" fill="#e8d8b7" stroke="#947b62" strokeWidth="3"/><path d="M17 39c1-14 11-23 24-23s23 9 24 23H17Z" fill="#c77965" stroke="#864d49" strokeWidth="4"/><circle cx="31" cy="28" r="3" fill="#f5e3bf"/><circle cx="47" cy="23" r="3" fill="#f5e3bf"/><path d="M25 65h30" stroke="#63824e" strokeWidth="4" strokeLinecap="round"/></>;
    else if (name.includes("katak")) image = <><path d="M17 49c0-13 9-21 23-21s23 8 23 21c0 10-10 16-23 16S17 59 17 49Z" fill="#76a75c" stroke="#476a40" strokeWidth="4"/><circle cx="29" cy="27" r="9" fill="#8fba69" stroke="#476a40" strokeWidth="3"/><circle cx="51" cy="27" r="9" fill="#8fba69" stroke="#476a40" strokeWidth="3"/><circle cx="29" cy="27" r="3" fill="#252d23"/><circle cx="51" cy="27" r="3" fill="#252d23"/><path d="M27 53c7 7 19 7 26 0" fill="none" stroke="#edc792" strokeWidth="3" strokeLinecap="round"/></>;
    else if (name.includes("ular")) image = <><path d="M17 60c17 4 11-17 29-17 20 0 19-21 1-24-14-2-16 11-7 13 7 1 9-6 4-8" fill="none" stroke="#698d50" strokeWidth="13" strokeLinecap="round"/><path d="M17 60c17 4 11-17 29-17 20 0 19-21 1-24-14-2-16 11-7 13 7 1 9-6 4-8" fill="none" stroke="#b5c77a" strokeWidth="6" strokeLinecap="round"/><circle cx="47" cy="21" r="2" fill="#1d2c20"/></>;
    else if (name.includes("elang")) image = <><path d="M12 49c12-3 17-18 29-20l-5 12 30-9-15 15 13 15-27-9-15 9 7-13-17 0Z" fill="#9b7857" stroke="#5c4b3c" strokeWidth="3" strokeLinejoin="round"/><path d="m56 42 10-2-6 8" fill="#dfb968"/></>;
    else image = <><circle cx="40" cy="40" r="24" fill="#98b778" stroke="#587448" strokeWidth="4"/><path d="M22 40h36M40 22v36" stroke="#e7e7b9" strokeWidth="4" strokeLinecap="round"/></>;
  }

  const frame = size === "arena" ? "h-[54px] w-[54px] sm:h-[58px] sm:w-[58px]" : size === "large" ? "h-16 w-16" : size === "card" ? "h-[58px] w-[58px]" : "h-11 w-11";
  return <svg viewBox="0 0 80 80" className={`${frame} shrink-0`} role="img" aria-label={`Ilustrasi ${label}`} fill="none">{image}</svg>;
}

function RunnerCharacter() {
  return <img src="/bio-rush-runner.png" className="bio-rush-runner h-full w-full object-contain drop-shadow-[0_5px_7px_rgba(0,0,0,.5)]" alt="Karakter pelari Bio Rush" draggable={false} />;
}

function DigestiveArtwork({ label, size = "small" }: { label: string; size?: "small" | "large" }) {
  const organ = label.toLowerCase();
  const svgSize = size === "large" ? "h-16 w-16" : "h-12 w-12";
  let drawing: React.ReactNode;
  if (organ.includes("mulut")) {
    drawing = <><path d="M16 34 Q40 15 64 34 Q40 56 16 34Z" fill="#db786f" stroke="#9c4c4c" strokeWidth="3"/><path d="M24 34h32M28 34v8m8-8v9m8-9v9m8-9v8" stroke="#fff7e8" strokeWidth="4" strokeLinecap="round"/><path d="M21 27q19-10 38 0" fill="none" stroke="#a94f55" strokeWidth="3"/></>;
  } else if (organ.includes("kerongkongan")) {
    drawing = <><path d="M38 10c-2 12 7 13 5 22-2 9-10 11-8 21 2 9 9 11 7 18" fill="none" stroke="#b94f55" strokeWidth="15" strokeLinecap="round"/><path d="M38 10c-2 12 7 13 5 22-2 9-10 11-8 21 2 9 9 11 7 18" fill="none" stroke="#f3b9a9" strokeWidth="8" strokeLinecap="round"/><path d="m35 60 7 9 7-9" fill="none" stroke="#fff4e8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></>;
  } else if (organ.includes("lambung")) {
    drawing = <><path d="M38 9v17c0 6 6 7 12 10 11 7 14 18 8 28-6 9-17 13-28 8-13-6-16-20-9-30 5-7 7-13 2-20-4-6 3-12 15-13Z" fill="#e98b7e" stroke="#a94f55" strokeWidth="3" strokeLinejoin="round"/><path d="M31 46c6 4 14 4 21 0m-23 8c7 4 15 4 22 0" fill="none" stroke="#f7c4af" strokeWidth="3" strokeLinecap="round"/></>;
  } else if (organ.includes("usus halus")) {
    drawing = <><path d="M25 16v8c-13-10-20 6-10 13-10 9 2 20 12 12-5 12 8 20 16 10m12-43v8c13-10 20 6 10 13 10 9-2 20-12 12 5 12-8 20-16 10" fill="none" stroke="#b65051" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/><path d="M31 35c-8-7-14 4-6 9-8 5-2 12 5 8m14-17c8-7 14 4 6 9 8 5 2 12-5 8" fill="none" stroke="#eaa28d" strokeWidth="5" strokeLinecap="round"/></>;
  } else if (organ.includes("usus besar")) {
    drawing = <><path d="M26 18v10c-12-8-18 5-10 13-9 8-3 20 8 16-2 10 8 17 16 11m12-50v10c12-8 18 5 10 13 9 8 3 20-8 16 2 10-8 17-16 11" fill="none" stroke="#9e4e50" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/><path d="M32 34c-2 7 3 10 8 7m0 0c6 5 10 0 8-6m-15 15c4 5 9 4 12 0" fill="none" stroke="#e8a28f" strokeWidth="4" strokeLinecap="round"/></>;
  } else if (organ.includes("rektum")) {
    drawing = <><path d="M29 16h22v18c0 9-4 13-11 18-6 4-6 10-6 17" fill="none" stroke="#a94f55" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/><path d="M29 16h22v18c0 9-4 13-11 18-6 4-6 10-6 17" fill="none" stroke="#f1b6a4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/><path d="M34 60h12" stroke="#fff0e4" strokeWidth="3" strokeLinecap="round"/></>;
  } else if (organ.includes("anus")) {
    drawing = <><path d="M30 13h20v26c0 8-4 12-10 16" fill="none" stroke="#a94f55" strokeWidth="13" strokeLinecap="round"/><path d="M40 51v6" stroke="#f1b6a4" strokeWidth="7" strokeLinecap="round"/><ellipse cx="40" cy="63" rx="14" ry="8" fill="#db786f" stroke="#98494d" strokeWidth="3"/><ellipse cx="40" cy="63" rx="5" ry="2.5" fill="#633b3c"/></>;
  } else if (organ.includes("hati")) {
    drawing = <><path d="M12 35c6-17 22-24 39-20 8 2 16 0 20 7 5 9-2 23-14 29-11 6-30 11-41 4-7-4-8-12-4-20Z" fill="#a94648" stroke="#79363d" strokeWidth="3"/><path d="M48 20c-2 9-3 18-1 28" fill="none" stroke="#e49a86" strokeWidth="3"/></>;
  } else if (organ.includes("pankreas")) {
    drawing = <><path d="M12 43c8-11 16-5 23-11 8-8 14-1 21-3 9-3 16 6 12 13-3 7-11 8-17 8-9 0-14 8-23 9-10 2-20-5-16-16Z" fill="#e3ad58" stroke="#a77337" strokeWidth="3"/><path d="M20 43h39" stroke="#fff0bc" strokeWidth="3" strokeLinecap="round"/></>;
  } else if (organ.includes("kantung empedu")) {
    drawing = <><path d="M39 14c5 12 19 20 16 36-2 11-10 18-17 19-8-1-16-8-17-19-2-15 13-25 18-36Z" fill="#77a64c" stroke="#4e773b" strokeWidth="3"/><path d="M39 13v-6" stroke="#4e773b" strokeWidth="4" strokeLinecap="round"/></>;
  } else {
    drawing = <><path d="M20 20h40v40H20z" fill="#f5d9cf" stroke="#ad5b55" strokeWidth="3"/><path d="M28 40h24m-12-12v24" stroke="#ad5b55" strokeWidth="4" strokeLinecap="round"/></>;
  }

  return <span className={`flex shrink-0 items-center justify-center rounded-xl bg-[#fff8ef] ${size === "large" ? "h-[76px] w-[76px]" : "h-14 w-14"}`}><svg viewBox="0 0 80 80" className={svgSize} role="img" aria-label={`Ilustrasi ${label}`} fill="none">{drawing}</svg></span>;
}
