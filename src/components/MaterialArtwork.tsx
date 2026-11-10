const artworkLabels: Record<number, string> = {
  1: "Ilustrasi sel dan organel",
  2: "Ilustrasi jaringan tumbuhan dan hewan",
  3: "Ilustrasi organ pencernaan",
  4: "Ilustrasi paru-paru dan pernapasan",
  5: "Ilustrasi jantung dan peredaran darah",
  6: "Ilustrasi ekosistem",
};

const palettes: Record<number, string> = {
  1: "bg-[#f5eaf2] dark:bg-[#3a2c38]",
  2: "bg-[#eaf2df] dark:bg-[#2c3a2a]",
  3: "bg-[#f8e8df] dark:bg-[#3d302b]",
  4: "bg-[#e4f0f2] dark:bg-[#29393b]",
  5: "bg-[#f6e7e5] dark:bg-[#3d2d2b]",
  6: "bg-[#e9f0dc] dark:bg-[#2c3928]",
};

function Artwork({ order }: { order: number }) {
  if (order === 1) return <>
    <circle cx="48" cy="48" r="34" fill="#f6cbd9" stroke="#a94f78" strokeWidth="3" />
    <circle cx="48" cy="48" r="27" fill="#ffe8ec" />
    <circle cx="52" cy="45" r="12" fill="#9c70bd" stroke="#704b92" strokeWidth="2" />
    <circle cx="55" cy="43" r="4" fill="#e7c4f3" />
    <path d="M26 40c5-8 10-7 14-3M57 67c5-5 10-4 13 1M26 58c4 4 8 4 11 1" fill="none" stroke="#d37899" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 28c5-3 9 0 8 4-1 3-5 4-9 2-3-2-2-5 1-6ZM68 53c5-2 8 1 6 5-1 3-5 3-8 1-2-2-1-5 2-6Z" fill="#f2a879" stroke="#bf775b" strokeWidth="1.5" />
  </>;
  if (order === 2) return <>
    <path d="M24 69V38c0-4 6-4 6 0v31M30 47h26M30 58h26" fill="none" stroke="#6b8d4f" strokeWidth="4" strokeLinecap="round" />
    <path d="M29 37c-9-1-12-9-10-15 9 0 15 5 13 13M30 44c8-12 18-14 25-10-4 10-13 15-25 13" fill="#83b85d" stroke="#4e7f43" strokeWidth="2" />
    <rect x="67" y="30" width="17" height="39" rx="5" fill="#f4b8b0" stroke="#bd726d" strokeWidth="2" />
    <path d="M75.5 31v37M68 43h15M68 56h15" stroke="#fff0e8" strokeWidth="2" />
    <circle cx="72" cy="38" r="2" fill="#bd726d" /><circle cx="79" cy="50" r="2" fill="#bd726d" /><circle cx="72" cy="63" r="2" fill="#bd726d" />
  </>;
  if (order === 3) return <>
    <path d="M43 15v15c0 5 5 7 10 8" fill="none" stroke="#d47b64" strokeWidth="7" strokeLinecap="round" />
    <path d="M52 35c7-4 20-2 21 8 1 6-4 9-8 12-4 3-4 8-2 12 2 8-5 14-14 11-8-3-10-12-6-19 3-5 6-10 2-15-4-4 0-8 7-9Z" fill="#ed9a83" stroke="#b95f58" strokeWidth="3" strokeLinejoin="round" />
    <path d="M43 54c-8-5-13 2-9 7-8 3-4 11 2 11-4 6 3 11 8 6M62 54c8-5 13 2 9 7 8 3 4 11-2 11 4 6-3 11-8 6" fill="none" stroke="#e5a83f" strokeWidth="4" strokeLinecap="round" />
    <path d="M44 61c5-5 11 4 16-1M43 68c5-5 11 4 17-1M47 75c4-4 8 2 12-1" fill="none" stroke="#b86c49" strokeWidth="2.5" strokeLinecap="round" />
  </>;
  if (order === 4) return <>
    <path d="M47 16v25M49 36c-5 0-8 5-11 9-3 5-10 8-11 17-1 10 5 17 13 15 8-2 11-10 11-21V41M51 36c5 0 8 5 11 9 3 5 10 8 11 17 1 10-5 17-13 15-8-2-11-10-11-21V41" fill="#f3a7a0" stroke="#bb6c6a" strokeWidth="3" strokeLinejoin="round" />
    <path d="M48 38 37 51M50 38l11 13M37 51v15M61 51v15M37 57l-7 6M37 61l7 5M61 57l7 6M61 61l-7 5" fill="none" stroke="#8e5967" strokeWidth="3" strokeLinecap="round" />
    <path d="M44 17h12" stroke="#5a8d8b" strokeWidth="6" strokeLinecap="round" />
  </>;
  if (order === 5) return <>
    <path d="M48 75 21 49C7 33 27 16 42 29l6 6 6-6c15-13 35 4 21 20L48 75Z" fill="#d95e5b" stroke="#a83e42" strokeWidth="3" strokeLinejoin="round" />
    <path d="M48 35v-17M48 18H37M48 18h11" fill="none" stroke="#4f86b5" strokeWidth="5" strokeLinecap="round" />
    <path d="M46 42c-7-8-14-1-11 5 2 4 7 6 12 9M52 40c6-5 12-1 11 4" fill="none" stroke="#f6b2a1" strokeWidth="3" strokeLinecap="round" />
    <path d="M49 49c-3-4-8-3-8 1 0 5 7 9 8 10 1-1 8-5 8-10 0-4-5-5-8-1Z" fill="#f8d6c7" stroke="#b54b4d" strokeWidth="1.5" />
  </>;
  return <>
    <circle cx="72" cy="23" r="10" fill="#f2c75c" />
    <path d="M9 63c15-18 27-17 39-4 10-14 23-16 39-4v31H9Z" fill="#91bd72" />
    <path d="M9 70c18-10 30-5 39 5 11-10 25-12 39-5v16H9Z" fill="#6a9f63" />
    <path d="M51 68V42M51 51c-10-1-15-7-15-14 9-2 16 2 18 10M51 55c8-11 17-12 23-8-4 9-12 13-23 12" fill="#4b8550" stroke="#356b42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 77v-8m-6 8 6-7 6 7" fill="none" stroke="#e8dfaf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 59c4-5 9-5 13 0-4 4-9 4-13 0Z" fill="#f5f2e8" stroke="#536f52" strokeWidth="1.5" />
  </>;
}

export function MaterialArtwork({ order, size = "small" }: { order: number; size?: "small" | "large" }) {
  const safeOrder = order >= 1 && order <= 6 ? order : 6;
  return (
    <span className={`flex shrink-0 items-center justify-center ${size === "large" ? "h-36 w-36 rounded-3xl md:h-40 md:w-40" : "h-16 w-16 rounded-2xl"} ${palettes[safeOrder]}`}>
      <svg viewBox="0 0 96 96" className={size === "large" ? "h-32 w-32 md:h-36 md:w-36" : "h-14 w-14"} role="img" aria-label={artworkLabels[safeOrder]}>
        <Artwork order={safeOrder} />
      </svg>
    </span>
  );
}
