import { updateDokterProfil } from "./dokter.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateDokterInput } from "./dokter.schema";

export async function updateDokter(input: UpdateDokterInput, adminId: string) {
  await updateDokterProfil(input);

  await catatPerubahan(adminId, "dokter", `Update profil dr. ${input.nama}`);

  const revalidated = await revalidatePublicHomepage();

  return { success: true, revalidated };
}
