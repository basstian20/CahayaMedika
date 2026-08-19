import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { UpdateDokterInput } from "./dokter.schema";

// Session-scoped client (authenticated), bukan service_role — pola sama dengan
// layanan.repository.ts (Backend Blueprint §10.1 poin 2).
//
// Insert dan update HARUS dipisah jadi 2 panggilan, bukan satu .upsert() atas
// array campuran: PostgREST generate satu SQL statement untuk seluruh baris
// dalam satu panggilan .upsert(), dengan kolom = union seluruh key di array
// itu — baris tanpa `id` (dokter baru) akan ikut terkirim `id: null` secara
// eksplisit kalau ADA baris lain di array yang sama yang punya `id`, dan itu
// melanggar NOT NULL constraint (ditemukan lewat uji end-to-end tambah dokter
// baru berdampingan dengan dokter existing, bukan asumsi).
export async function upsertDokter(
  items: Omit<UpdateDokterInput["dokter"][number], "_delete">[]
): Promise<{ upsertedCount: number }> {
  if (items.length === 0) return { upsertedCount: 0 };

  const supabase = await createServerSupabaseClient();
  const toInsert = items.filter((item) => !item.id);
  const toUpdate = items.filter((item) => item.id);

  let count = 0;

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from("dokter")
      .insert(
        toInsert.map(({ nama, spesialisasi, urutan }) => ({
          nama,
          spesialisasi,
          urutan,
          updated_at: new Date().toISOString(),
        }))
      )
      .select("id");
    if (error) throw new InternalError(`Gagal tambah dokter baru: ${error.message}`);
    count += data?.length ?? toInsert.length;
  }

  if (toUpdate.length > 0) {
    const { data, error } = await supabase
      .from("dokter")
      .upsert(
        toUpdate.map(({ id, nama, spesialisasi, urutan }) => ({
          id,
          nama,
          spesialisasi,
          urutan,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      )
      .select("id");
    if (error) throw new InternalError(`Gagal update dokter: ${error.message}`);
    count += data?.length ?? toUpdate.length;
  }

  return { upsertedCount: count };
}

export async function deleteDokter(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createServerSupabaseClient();
  // on delete cascade ke jadwal_praktik (migrasi 0004) — jadwal dokter yang
  // dihapus ikut terhapus otomatis, tidak perlu delete manual di sini.
  const { error } = await supabase.from("dokter").delete().in("id", ids);
  if (error) throw new InternalError(`Gagal hapus dokter: ${error.message}`);
}

export async function updateFotoUrl(dokterId: string, fotoUrl: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("dokter")
    .update({ foto_url: fotoUrl, updated_at: new Date().toISOString() })
    .eq("id", dokterId);

  if (error) throw new InternalError(`Gagal update foto_url dokter: ${error.message}`);
}
