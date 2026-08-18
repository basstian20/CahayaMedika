import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { UpdateLayananInput } from "./layanan.schema";

// Session-scoped client (authenticated) — bukan admin/service_role client,
// keputusan final Blueprint §10.1 poin 2. RLS INSERT/UPDATE/DELETE untuk
// role authenticated yang cocok UID admin (Blueprint §6, TSD §7.1) tetap berlaku.
//
// Insert dan update dipisah jadi 2 panggilan, bukan satu .upsert() atas array
// campuran: PostgREST generate satu SQL statement untuk seluruh baris dalam
// satu panggilan .upsert(), dengan kolom = union seluruh key di array itu —
// baris tanpa `id` (layanan baru) akan ikut terkirim `id: null` eksplisit
// kalau ADA baris lain di array yang sama yang punya `id`, melanggar NOT NULL
// constraint (bug yang sama ditemukan & diperbaiki di dokter.repository.ts
// lewat uji end-to-end tambah dokter baru berdampingan dengan dokter existing).
export async function upsertLayanan(
  items: Omit<UpdateLayananInput["layanan"][number], "_delete">[]
): Promise<{ upsertedCount: number }> {
  if (items.length === 0) return { upsertedCount: 0 };

  const supabase = createServerSupabaseClient();
  const toInsert = items.filter((item) => !item.id);
  const toUpdate = items.filter((item) => item.id);

  let count = 0;

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from("layanan")
      .insert(
        toInsert.map(({ nama, deskripsi, urutan, tampil_di_homepage }) => ({
          nama,
          deskripsi,
          urutan,
          tampil_di_homepage,
          updated_at: new Date().toISOString(),
        }))
      )
      .select("id");
    if (error) throw new InternalError(`Gagal tambah layanan baru: ${error.message}`);
    count += data?.length ?? toInsert.length;
  }

  if (toUpdate.length > 0) {
    const { data, error } = await supabase
      .from("layanan")
      .upsert(
        toUpdate.map(({ id, nama, deskripsi, urutan, tampil_di_homepage }) => ({
          id,
          nama,
          deskripsi,
          urutan,
          tampil_di_homepage,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      )
      .select("id");
    if (error) throw new InternalError(`Gagal update layanan: ${error.message}`);
    count += data?.length ?? toUpdate.length;
  }

  return { upsertedCount: count };
}

export async function deleteLayanan(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("layanan").delete().in("id", ids);
  if (error) throw new InternalError(`Gagal hapus layanan: ${error.message}`);
}
