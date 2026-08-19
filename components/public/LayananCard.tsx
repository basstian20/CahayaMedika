import type { LucideIcon } from "lucide-react";
import { Apple, Baby, Smile, Stethoscope, Syringe } from "lucide-react";

interface LayananCardProps {
  nama: string;
  deskripsi: string;
}

// Data layanan tidak punya field icon sendiri (layanan.schema.ts) — ikon
// dipilih dari kata kunci di nama layanan. Fallback Stethoscope cocok untuk
// item generik ("Pemeriksaan Umum" dsb).
const IKON_KEYWORDS: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /vaksin/i, icon: Syringe },
  { match: /gizi|nutrisi/i, icon: Apple },
  { match: /anak/i, icon: Baby },
  { match: /gigi|dental/i, icon: Smile },
];

function pilihIkonLayanan(nama: string): LucideIcon {
  return IKON_KEYWORDS.find(({ match }) => match.test(nama))?.icon ?? Stethoscope;
}

// Kartu Layanan (UI Template Spec §5, S1/S2) — ikon line-icon konsisten,
// nama, deskripsi singkat. Lebar kartu dipatok via calc() (bukan grid-cols)
// supaya bisa dibungkus flex+justify-center di page.tsx — baris terakhir yang
// tidak penuh jadi center, bukan rata kiri berlubang.
export function LayananCard({ nama, deskripsi }: LayananCardProps) {
  const Ikon = pilihIkonLayanan(nama);

  return (
    <div className="w-full rounded-xl border border-nakhoda/10 bg-white p-7 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg md:w-[calc(33.333%-0.667rem)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cahaya/10">
        <Ikon className="h-5 w-5 text-cahaya" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold text-nakhoda">{nama}</h3>
      <p className="text-sm leading-relaxed text-nakhoda/70">{deskripsi}</p>
    </div>
  );
}
