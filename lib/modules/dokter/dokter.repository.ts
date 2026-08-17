import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InternalError, NotFoundError } from "@/lib/shared/errors";
import type { UpdateDokterInput } from "./dokter.schema";

export async function updateDokterProfil(input: UpdateDokterInput): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dokter")
    .update({
      nama: input.nama,
      spesialisasi: input.spesialisasi,
      ...(input.urutan !== undefined ? { urutan: input.urutan } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.dokter_id)
    .select("id")
    .maybeSingle();

  if (error) throw new InternalError(`Gagal update profil dokter: ${error.message}`);
  if (!data) throw new NotFoundError(`Dokter dengan id ${input.dokter_id} tidak ditemukan.`);
}

export async function updateFotoUrl(dokterId: string, fotoUrl: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("dokter")
    .update({ foto_url: fotoUrl, updated_at: new Date().toISOString() })
    .eq("id", dokterId);

  if (error) throw new InternalError(`Gagal update foto_url dokter: ${error.message}`);
}
