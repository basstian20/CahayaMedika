import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateFotoUrl } from "./dokter.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import { ValidationError, InternalError } from "@/lib/shared/errors";
import { ALLOWED_FOTO_MIME, MAX_FOTO_SIZE_BYTES, FOTO_MIME_TO_EXT } from "./dokter.schema";

// Wrapper eksplisit ke Supabase Storage — nama class isolasi disebut Blueprint §8
// sebagai DokterFotoStorageClient; diimplementasikan di sini sebagai fungsi
// modul (bukan class) karena tidak ada state yang perlu dipertahankan lintas
// panggilan — [ASUMSI: penyederhanaan implementasi, tidak mengubah kontrak/nama
// file yang sudah dipetakan Blueprint §5].
export async function uploadFotoDokter(file: File, dokterId: string, adminId: string) {
  validateFoto(file); // TSD §9 risiko: validasi ukuran & tipe MIME sebelum upload

  const supabase = createServerSupabaseClient();
  // Ekstensi dari MIME tervalidasi, bukan file.name — file.name datang dari
  // multipart body yang client-controlled, tidak boleh dipercaya untuk
  // menyusun storage path (risiko path/prefix injection).
  const ext = FOTO_MIME_TO_EXT[file.type as (typeof ALLOWED_FOTO_MIME)[number]];
  const path = `${dokterId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("dokter-foto") // nama bucket final — Blueprint §10.1 poin 3
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new InternalError(`Gagal upload foto: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from("dokter-foto").getPublicUrl(path);
  const fotoUrl = publicUrlData.publicUrl;

  await updateFotoUrl(dokterId, fotoUrl);
  await catatPerubahan(adminId, "dokter", `Update foto profil dokter (${dokterId})`);
  const revalidated = await revalidatePublicHomepage();

  return { foto_url: fotoUrl, revalidated };
}

function validateFoto(file: File): void {
  if (!ALLOWED_FOTO_MIME.includes(file.type as (typeof ALLOWED_FOTO_MIME)[number])) {
    throw new ValidationError(
      `Tipe file ${file.type} tidak didukung. Gunakan JPEG, PNG, atau WebP.`
    );
  }
  if (file.size > MAX_FOTO_SIZE_BYTES) {
    throw new ValidationError(
      `Ukuran file melebihi batas ${MAX_FOTO_SIZE_BYTES / 1024 / 1024}MB.`
    );
  }
}
