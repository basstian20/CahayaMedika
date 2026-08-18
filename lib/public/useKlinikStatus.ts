"use client";

import { useEffect, useState } from "react";

interface JadwalHari {
  hari: string; // "senin" | "selasa" | ... — sesuai enum TSD §5.1
  jam_mulai: string; // "HH:mm"
  jam_selesai: string; // "HH:mm"
}

type StatusKlinik = "buka" | "tutup";

const HARI_INDEX = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

// "Jam operasional klinik" hari itu = rentang gabungan (jam_mulai TERAWAL,
// jam_selesai TERAKHIR) dari semua dokter yang praktik hari itu — bukan jadwal
// satu dokter yang kebetulan match duluan. Perbandingan string "HH:mm" aman
// karena selalu zero-padded (sama seperti perbandingan jamSekarang di bawah).
// Trade-off yang disadari: kalau ada celah kosong antar jam praktik dokter
// (mis. dokter A pagi, dokter B sore), rentang gabungan ini tidak menandai
// celah itu sebagai "tutup" — direct simplification yang sudah dikonfirmasi user.
function gabungkanJadwalHari(rows: JadwalHari[], hari: string): JadwalHari | null {
  const rowsHariIni = rows.filter((j) => j.hari === hari);
  if (rowsHariIni.length === 0) return null;

  const jamMulai = rowsHariIni.reduce((min, j) => (j.jam_mulai < min ? j.jam_mulai : min), rowsHariIni[0].jam_mulai);
  const jamSelesai = rowsHariIni.reduce(
    (max, j) => (j.jam_selesai > max ? j.jam_selesai : max),
    rowsHariIni[0].jam_selesai
  );

  return { hari, jam_mulai: jamMulai, jam_selesai: jamSelesai };
}

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

      const jadwalHariIni = gabungkanJadwalHari(jadwalMingguIni, hariIni);

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
