const botanical = {
  50: "#F6F8EF",
  100: "#E7EFDA",
  200: "#D4E4C1",
  300: "#B8D497",
  400: "#9FC47E",
  500: "#80B155",
  600: "#67983F",
  700: "#498428",
  800: "#3C742B",
  900: "#336A29",
  950: "#254F20",
};

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Satu palet botani dipakai untuk brand dan aksen agar warna ant halaman konsisten.
        // Permukaan "white" dibuat hijau pucat agar dashboard tidak kembali menjadi putih polos.
        white: "#F6F8EF",
        aurora: botanical,
        brand: botanical,
        sage: botanical,
        green: botanical,
        emerald: botanical,
        lime: botanical,
        teal: botanical,
        slate: {
          50: "#F7F9F3",
          100: "#EFF3E8",
          200: "#E0E8D7",
          300: "#C9D4BE",
          400: "#9EAC8D",
          500: "#718263",
          600: "#566747",
          700: "#405238",
          800: "#2F402B",
          900: "#223321",
          950: "#152315",
        },
      },
    },
  },
  plugins: [],
};
export default config;
