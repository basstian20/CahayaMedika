"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Slideshow fasilitas layanan — pengganti panel visual statis. Foto asli
// fasilitas klinik (public/images/fasilitas/), disiapkan sebagai aset statis
// lokal karena bersifat tetap (bukan konten yang diedit admin, beda dengan
// foto_url dokter yang data-driven lewat Supabase Storage).
// Auto-rotate adalah motion KEDUA di luar satu-satunya animasi yang dikunci
// UI Template Spec §3 (glow Indikator Cahaya) — pengecualian sadar atas
// instruksi eksplisit pemilik proyek, dicatat sebagai revisi di dokumen
// tersebut. Berhenti berotasi otomatis saat prefers-reduced-motion, dan saat
// pointer/fokus ada di atas panel.
interface Slide {
  label: string;
  src: string;
}

const SLIDES: Slide[] = [
  {
    label: "Ruang Tunggu Keluarga",
    src: "/images/fasilitas/ruang-tunggu-keluarga.jpg",
  },
  {
    label: "Ruang Konsultasi Dokter",
    src: "/images/fasilitas/ruang-konsultasi-dokter.jpg",
  },
  {
    label: "Ruang Bermain Anak",
    src: "/images/fasilitas/ruang-bermain-anak.jpg",
  },
  {
    label: "Apotek & Ruang Obat",
    src: "/images/fasilitas/apotek-ruang-obat.jpg",
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
      {SLIDES.map((slide, i) => (
        <div
          key={slide.label}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority={i === 0}
            loading={i === 0 ? undefined : "eager"}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nakhoda/80 via-nakhoda/10 to-transparent" aria-hidden />
          <p className="absolute bottom-11 left-1/2 max-w-[240px] -translate-x-1/2 text-center text-sm font-medium text-white">
            {slide.label}
          </p>
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
