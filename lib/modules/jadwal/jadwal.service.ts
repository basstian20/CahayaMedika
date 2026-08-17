import { upsertJadwalBatch } from "./jadwal.repository";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateJadwalInput } from "./jadwal.schema";

// Orkestrasi — jalur kritis SOW §8, response harus mengandung
// `revalidated: boolean` sesuai contoh response TSD §4.3.
export async function updateJadwal(input: UpdateJadwalInput, adminId: string) {
  // Upsert jadwal + insert riwayat terjadi dalam SATU transaction Postgres
  // lewat fn_update_jadwal_dan_riwayat (Blueprint §10.1 poin 5) — bukan dua
  // panggilan terpisah, karena Supabase JS client tidak punya transaction
  // multi-statement lintas panggilan.
  const ringkasan = buildRingkasan(input.jadwal);
  const { updatedCount } = await upsertJadwalBatch(input.jadwal, adminId, ringkasan);

  // NB: catatPerubahan tidak dipanggil di sini — fn_update_jadwal_dan_riwayat
  // sudah insert riwayat_perubahan di dalam RPC yang sama (lihat jadwal.repository.ts).

  const revalidated = await revalidatePublicHomepage();

  return { updated_count: updatedCount, revalidated };
}

function buildRingkasan(jadwal: UpdateJadwalInput["jadwal"]): string {
  const dokterCount = new Set(jadwal.map((j) => j.dokter_id)).size;
  return `Update jadwal untuk ${dokterCount} dokter (${jadwal.length} entri hari)`;
}
