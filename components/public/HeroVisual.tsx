// Panel visual hero — pengganti hero slideshow foto di docs/design.html.
// Proyek ini template portofolio (bukan klien nyata, CLAUDE.md §0), jadi panel
// ini murni ilustratif (blob token warna + copy demo), BUKAN carousel/foto asli
// — sengaja statis, tidak menambah motion baru di luar satu-satunya animasi
// yang sudah dikunci (glow Indikator Cahaya, UI Template Spec §3 Motion).
export function HeroVisual() {
  return (
    <div className="relative h-[280px] overflow-hidden rounded-xl bg-nakhoda sm:h-[360px] lg:h-[420px]">
      <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-cahaya/40 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-jaga/30 blur-3xl" aria-hidden />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          className="h-16 w-16 text-white/80"
          aria-hidden
        >
          <path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.3 5 6 5c2 0 3.3 1.1 4 2.1C10.7 6.1 12 5 14 5c3.7 0 5.3 3.9 3.5 7.5C19 16.65 12 21 12 21z" />
          <path d="M9 12h2l1-2 1 3 1-1h1" />
        </svg>
        <p className="max-w-[240px] text-sm font-medium text-white/85">
          Melayani kesehatan keluarga Anda dengan hangat, dekat, dan bisa diandalkan.
        </p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/95 px-4 py-3 shadow-card sm:left-6 sm:right-auto sm:w-64">
        <div>
          <div className="font-mono text-lg font-bold tabular-nums text-cahaya">500+</div>
          <div className="text-xs text-nakhoda/60">Kunjungan keluarga/bulan</div>
        </div>
      </div>
    </div>
  );
}
