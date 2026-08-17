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
        nakhoda: "#1F3B3B",
        cahaya: "#E2963C",
        "cta-whatsapp": "#1E9E5A",
        latar: "#F1F4F2",
        jaga: "#4C8C6B",
        senja: "#9C7A5B",
        error: "#C0392B",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plus-jakarta-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        xl: "12px",
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
