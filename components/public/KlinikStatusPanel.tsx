"use client";

import { useKlinikStatus } from "@/lib/public/useKlinikStatus";
import { IndikatorCahaya } from "./IndikatorCahaya";

interface KlinikStatusPanelProps {
  jadwalMingguIni: { hari: string; jam_mulai: string; jam_selesai: string }[];
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string };
}

function formatJam(jam: string) {
  return jam.slice(0, 5).replace(":", ".");
}

// Varian IndikatorCahaya + jam praktik hari ini untuk section Kontak & Lokasi
// (S4) — dipakai di atas latar gelap, pola visual mengikuti docs/design.html
// (status besar + jam di atas alamat), status dihitung ulang di client sama
// seperti KlinikStatusBadge (TSD §3.3), bukan duplikasi logic baru.
export function KlinikStatusPanel({ jadwalMingguIni, jamOperasionalDefault }: KlinikStatusPanelProps) {
  const { status, jadwalHariIni } = useKlinikStatus(jadwalMingguIni, jamOperasionalDefault);

  return (
    <div className="mb-5">
      <IndikatorCahaya status={status} onDark />
      {jadwalHariIni && (
        <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
          {formatJam(jadwalHariIni.jam_mulai)}–{formatJam(jadwalHariIni.jam_selesai)}
        </p>
      )}
    </div>
  );
}
