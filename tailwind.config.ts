import type { Config } from "tailwindcss";

// Token warna/tipografi/radius — otoritatif dari
// docs/Klinik_Cahaya_Medika_UI_Template_Spec.md §3. Jangan improvisasi
// token baru di luar yang terdaftar di sini (CLAUDE.md §2.2).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "360px",
      md: "768px",
      lg: "1280px",
    },
    extend: {
      colors: {
        // Hex = konversi sRGB dari nilai oklch() di design.html/UI Template Spec §3.
        // Disimpan sebagai hex (bukan oklch() string) supaya modifier opacity Tailwind
        // (/10, /70, dst — dipakai luas di seluruh komponen) tetap resolve dengan benar.
        nakhoda: "#151D18", // oklch(0.22 0.015 155)
        cahaya: "#497F5D", // oklch(0.55 0.08 155)
        "cta-whatsapp": "#1E9E5A",
        latar: "#F5FAF6", // oklch(0.98 0.007 155)
        jaga: "#67BB6B", // oklch(0.72 0.14 145)
        senja: "#9C7A5B",
        error: "#C0392B",
      },
      fontFamily: {
        display: ["var(--font-figtree)", "sans-serif"],
        body: ["var(--font-figtree)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        xl: "16px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(31,59,59,0.08)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        breathe: "breathe 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
