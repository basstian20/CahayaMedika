import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { UpdateLayananInput } from "./layanan.schema";

// Session-scoped client (authenticated) — bukan admin/service_role client,
// keputusan final Blueprint §10.1 poin 2. RLS INSERT/UPDATE/DELETE untuk
// role authenticated yang cocok UID admin (Blueprint §6, TSD §7.1) tetap berlaku.
export async function upsertLayanan(
  items: Omit<UpdateLayananInput["layanan"][number], "_delete">[]
): Promise<{ upsertedCount: number }> {
  if (items.length === 0) return { upsertedCount: 0 };

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("layanan")
    .upsert(
      items.map(({ id, nama, deskripsi, urutan, tampil_di_homepage }) => ({
        ...(id ? { id } : {}),
        nama,
        deskripsi,
        urutan,
        tampil_di_homepage,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "id" }
    )
    .select("id");

  if (error) throw new InternalError(`Gagal upsert layanan: ${error.message}`);
  return { upsertedCount: data?.length ?? items.length };
}

export async function deleteLayanan(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("layanan").delete().in("id", ids);
  if (error) throw new InternalError(`Gagal hapus layanan: ${error.message}`);
}
