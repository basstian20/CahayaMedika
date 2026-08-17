"use client";

import { useEffect, useState } from "react";

interface JadwalHari {
  hari: string; // "senin" | "selasa" | ... — sesuai enum TSD §5.1
  jam_mulai: string; // "HH:mm"
  jam_selesai: string; // "HH:mm"
}

type StatusKlinik = "buka" | "tutup";

const HARI_INDEX = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

// WAJIB Asia/Jakarta di-hardcode — TIDAK BOLEH pakai timezone browser
// pengunjung (TSD §10, mitigasi risiko TSD §9 baris ke-2: "bug timezone").
function getJakartaNow(): Date {
  const now = new Date();
  const jakartaString = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  return new Date(jakartaString);
}

// Dihitung ulang di client tiap kali dipanggil (bukan sekali saat page load)
// — badge harus akurat terlepas dari kapan cache ISR terakhir di-generate (TSD §3.3).
export function useKlinikStatus(
  jadwalMingguIni: JadwalHari[],
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string }
): { status: StatusKlinik | "unknown"; jadwalHariIni: JadwalHari | null } {
  const [result, setResult] = useState<{
    status: StatusKlinik | "unknown";
    jadwalHariIni: JadwalHari | null;
  }>({
    status: "unknown",
    jadwalHariIni: null,
  });

  useEffect(() => {
    function compute() {
      const jakartaNow = getJakartaNow();
      const hariIni = HARI_INDEX[jakartaNow.getDay()];
      const jamSekarang = `${String(jakartaNow.getHours()).padStart(2, "0")}:${String(
        jakartaNow.getMinutes()
      ).padStart(2, "0")}`;

      const jadwalHariIni = jadwalMingguIni.find((j) => j.hari === hariIni) ?? null;

      // State Empty: fallback ke jam_operasional_default kalau jadwal minggu
      // ini belum diisi admin (TSD §5.3).
      const effectiveJadwal =
        jadwalHariIni ?? (jamOperasionalDefault ? { hari: hariIni, ...jamOperasionalDefault } : null);

      if (!effectiveJadwal) {
        setResult({ status: "unknown", jadwalHariIni: null });
        return;
      }

      const isBuka =
        jamSekarang >= effectiveJadwal.jam_mulai && jamSekarang < effectiveJadwal.jam_selesai;

      setResult({ status: isBuka ? "buka" : "tutup", jadwalHariIni: effectiveJadwal });
    }

    compute();
    // Recompute tiap menit — badge harus tetap akurat kalau pengunjung
    // membiarkan tab terbuka melewati jam tutup.
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [jadwalMingguIni, jamOperasionalDefault]);

  return result;
}
