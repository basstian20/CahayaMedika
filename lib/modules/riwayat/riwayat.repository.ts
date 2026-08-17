import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError } from "@/lib/shared/errors";
import type { JenisPerubahan } from "./riwayat.service";

interface RiwayatRow {
  id: string;
  admin_email: string;
  jenis_perubahan: string;
  ringkasan: string;
  created_at: string;
}

export async function insertRiwayat(
  adminId: string,
  jenis: JenisPerubahan,
  ringkasan: string
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("riwayat_perubahan")
    .insert({ admin_id: adminId, jenis_perubahan: jenis, ringkasan });

  if (error) throw new InternalError(`Gagal mencatat riwayat perubahan: ${error.message}`);
}

// Reverse-chronological, join ke auth.users untuk admin_email lewat FK
// constraint riwayat_perubahan_admin_id_fkey (supabase/migrations/0005) sesuai contoh TSD §4.3
export async function paginateRiwayat(
  page: number,
  limit: number
): Promise<{ data: RiwayatRow[]; page: number; has_more: boolean }> {
  const supabase = createServerSupabaseClient();
  const from = (page - 1) * limit;
  const to = from + limit; // ambil 1 ekstra untuk deteksi has_more

  const { data, error } = await supabase
    .from("riwayat_perubahan")
    .select("id, jenis_perubahan, ringkasan, created_at, admin:admin_id(email)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new InternalError(`Gagal mengambil riwayat perubahan: ${error.message}`);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    jenis_perubahan: string;
    ringkasan: string;
    created_at: string;
    admin: { email: string } | null;
  }>;

  const hasMore = rows.length > limit;
  const page_data = rows.slice(0, limit).map((r) => ({
    id: r.id,
    admin_email: r.admin?.email ?? "",
    jenis_perubahan: r.jenis_perubahan,
    ringkasan: r.ringkasan,
    created_at: r.created_at,
  }));

  return { data: page_data, page, has_more: hasMore };
}
