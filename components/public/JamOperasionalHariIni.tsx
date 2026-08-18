"use client";

import { useKlinikStatus } from "@/lib/public/useKlinikStatus";

interface JamOperasionalHariIniProps {
  jadwalMingguIni: { hari: string; jam_mulai: string; jam_selesai: string }[];
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string };
}

function formatJam(jam: string) {
  return jam.slice(0, 5).replace(":", ".");
}

// Badge Kepercayaan "Jam operasional" harus sinkron dengan Indikator Cahaya
// (jam hari ini yang sebenarnya dari jadwal_praktik), bukan jam_operasional_default
// statis yang ditampilkan apa adanya tanpa memandang hari — itu yang bikin trust-strip
// bisa bilang "buka sampai 20.00" sementara status live sudah "Tutup". jam_operasional_default
// tetap dipakai sebagai fallback (TSD §5.3) via useKlinikStatus, termasuk sebagai nilai
// tampilan awal sebelum hook selesai menghitung di client (hindari flash kosong).
export function JamOperasionalHariIni({ jadwalMingguIni, jamOperasionalDefault }: JamOperasionalHariIniProps) {
  const { jadwalHariIni } = useKlinikStatus(jadwalMingguIni, jamOperasionalDefault);
  const jam = jadwalHariIni ?? jamOperasionalDefault;

  if (!jam) return <span aria-hidden>—</span>;

  return (
    <>
      {formatJam(jam.jam_mulai)}–{formatJam(jam.jam_selesai)}
    </>
  );
}
