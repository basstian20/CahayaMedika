import { insertRiwayat, paginateRiwayat } from "./riwayat.repository";

export type JenisPerubahan = "jadwal" | "layanan" | "dokter";

// Dipanggil GET Route Handler
export async function listRiwayat(page: number, limit: number) {
  return paginateRiwayat(page, limit);
}

// Dipanggil modul lain (Layanan/Dokter/Jadwal) setelah write sukses —
// TANPA filter tanggal, sesuai keputusan UX Wireframe §5 poin 6 (Blueprint §4).
export async function catatPerubahan(
  adminId: string,
  jenis: JenisPerubahan,
  ringkasan: string
): Promise<void> {
  await insertRiwayat(adminId, jenis, ringkasan);
}
