"use client";

import { useEffect, useRef, useState } from "react";

// Slideshow fasilitas layanan — pengganti panel visual statis. Proyek ini
// template portofolio (bukan klien nyata, CLAUDE.md §0), jadi slide di sini
// ilustratif (tidak ada foto asli untuk dipasang), BUKAN carousel foto asli.
// Auto-rotate adalah motion KEDUA di luar satu-satunya animasi yang dikunci
// UI Template Spec §3 (glow Indikator Cahaya) — pengecualian sadar atas
// instruksi eksplisit pemilik proyek, dicatat sebagai revisi di dokumen
// tersebut. Berhenti berotasi otomatis saat prefers-reduced-motion, dan saat
// pointer/fokus ada di atas panel.
interface Slide {
  label: string;
  icon: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    label: "Ruang Tunggu Keluarga",
    icon: (
      <>
        <circle cx="8" cy="9" r="2.5" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3 19v-2a3 3 0 0 1 3-3h1a3 3 0 0 1 2.8 2" />
        <path d="M14.2 16A3 3 0 0 1 17 14h1a3 3 0 0 1 3 3v2" />
      </>
    ),
  },
  {
    label: "Ruang Konsultasi Dokter",
    icon: (
      <>
        <path d="M8 3v5a4 4 0 0 0 8 0V3" />
        <path d="M12 12v3a5 5 0 0 0 5 5 3 3 0 0 0 3-3" />
        <circle cx="20" cy="9" r="1.6" />
      </>
    ),
  },
  {
    label: "Ruang Bermain Anak",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M9 8h6" />
      </>
    ),
  },
  {
    label: "Apotek & Ruang Obat",
    icon: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <path d="M12 9v6" />
        <path d="M9 12h6" />
      </>
    ),
  },
];

const AUTO_ROTATE_MS = 4500;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      if (reducedMotionRef.current) return;
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [paused]);

  function goTo(i: number) {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }

  return (
    <div
      className="relative h-[280px] overflow-hidden rounded-xl bg-nakhoda sm:h-[360px] lg:h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-cahaya/40 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-jaga/30 blur-3xl" aria-hidden />

      {SLIDES.map((slide, i) => (
        <div
          key={slide.label}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            className="h-16 w-16 text-white/80"
            aria-hidden
          >
            {slide.icon}
          </svg>
          <p className="max-w-[240px] text-sm font-medium text-white/85">{slide.label}</p>
        </div>
      ))}

      <span className="sr-only" role="status" aria-live="polite">
        Slide {index + 1} dari {SLIDES.length}: {SLIDES[index].label}
      </span>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Slide sebelumnya"
        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-nakhoda transition hover:bg-white"
      >
        <span aria-hidden>‹</span>
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Slide berikutnya"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-nakhoda transition hover:bg-white"
      >
        <span aria-hidden>›</span>
      </button>

      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.label}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ke slide ${i + 1}: ${slide.label}`}
            aria-current={i === index ? "true" : undefined}
            className="flex h-11 w-11 items-center justify-center"
          >
            <span className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`} aria-hidden />
          </button>
        ))}
      </div>

      <div className="absolute right-4 top-4 hidden rounded-xl bg-white/95 px-4 py-3 shadow-card sm:block">
        <div className="font-mono text-lg font-bold tabular-nums text-cahaya">500+</div>
        <div className="text-xs text-nakhoda/60">Kunjungan keluarga/bulan</div>
      </div>
    </div>
  );
}
