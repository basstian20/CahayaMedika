import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { UpdateJadwalInput } from "./jadwal.schema";

// Upsert batch lewat Postgres function fn_update_jadwal_dan_riwayat via .rpc() —
// menjamin atomicity write jadwal + insert riwayat dalam satu transaction sungguhan
// (TSD §3.3 langkah 4, keputusan final Blueprint §10.1 poin 5).
// Signature RPC: fn_update_jadwal_dan_riwayat(p_jadwal jsonb, p_admin_id uuid, p_ringkasan text)
// RETURNS integer — lihat supabase/migrations/0006_fn_update_jadwal_dan_riwayat.sql
export async function upsertJadwalBatch(
  jadwal: UpdateJadwalInput["jadwal"],
  adminId: string,
  ringkasan: string
): Promise<{ updatedCount: number }> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("fn_update_jadwal_dan_riwayat", {
    p_jadwal: jadwal,
    p_admin_id: adminId,
    p_ringkasan: ringkasan,
  });

  if (error) {
    throw new InternalError(`Gagal update jadwal: ${error.message}`);
  }

  return { updatedCount: typeof data === "number" ? data : jadwal.length };
}
