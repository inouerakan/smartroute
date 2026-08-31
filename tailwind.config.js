/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 1. Dark (Kontras Tinggi: Sangat Gelap -> Gelap -> Sedang)
        dark: {
          1: "#18181B", // Zinc-900 → Teks gelap (soft black, bukan pure black)
          2: "#27272A", // Zinc-800 → Card sekunder (HistoryCard) — kontras jelas dari bg
          3: "#1C1C1E", // iOS System Background → Background utama halaman (elegan, tidak mati)
          4: "#3F3F46", // Zinc-700 → Tombol non-aktif / inner element — cukup terang agar terasa interaktif
        },

        // 2. Light (Kontras Tinggi: Putih Murni -> Abu Muda -> Abu Sedang)
        light: {
          1: "#FFFFFF", // Pure White (Card Utama)
          2: "#E2E8F0", // Soft Gray / Off-White (Background Halaman)
          3: "#94A3B8", // Slate Gray (Input / Border / Container Muted)
        },

        // 3. Primary (Warna Utama Brand)
        primary: {
          DEFAULT: "#3B82F6", // Bright Royal Blue (Tailwind Blue-500) — Cerah, modern, sangat terbaca di dark bg
          emerald: "#10B981", // Vibrant Emerald (Tailwind Emerald-500) — Hijau aksi yang "hidup" dan inviting
          mint: "#6EE7B7", // Soft Bright Mint (Tailwind Emerald-300) — Pastel yang cukup terang untuk teks/badge di bg gelap
        },

        // 4. Accent (Status & Indikator)
        accent: {
          DEFAULT: "#F59E0B",
          orange: "#F59E0B",
          green: "#00B074",
          red: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};
