"use client";

import { useKlinikStatus } from "@/lib/public/useKlinikStatus";
import { IndikatorCahaya } from "./IndikatorCahaya";

interface KlinikStatusBadgeProps {
  jadwalMingguIni: { hari: string; jam_mulai: string; jam_selesai: string }[];
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string };
}

// Client wrapper — Server Component page.tsx query data mentah jadwal,
// status buka/tutup dihitung di sini (client-side, TSD §3.3).
export function KlinikStatusBadge({ jadwalMingguIni, jamOperasionalDefault }: KlinikStatusBadgeProps) {
  const { status } = useKlinikStatus(jadwalMingguIni, jamOperasionalDefault);
  return <IndikatorCahaya status={status} />;
}
