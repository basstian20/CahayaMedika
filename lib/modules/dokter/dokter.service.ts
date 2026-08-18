import { upsertDokter, deleteDokter } from "./dokter.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateDokterInput } from "./dokter.schema";

// Batch upsert + delete, pola sama dengan layanan.service.ts — dokter yang
// dihapus otomatis membawa jadwal_praktik miliknya (on delete cascade).
export async function updateDokter(input: UpdateDokterInput, adminId: string) {
  const toDelete = input.dokter.filter((item) => item._delete && item.id);
  const toUpsert = input.dokter.filter((item) => !item._delete);

  if (toDelete.length > 0) {
    await deleteDokter(toDelete.map((item) => item.id as string));
  }
  const { upsertedCount } = await upsertDokter(toUpsert);

  await catatPerubahan(
    adminId,
    "dokter",
    `Update ${upsertedCount} dokter, hapus ${toDelete.length} dokter`
  );

  const revalidated = await revalidatePublicHomepage();

  return {
    success: true as const,
    updated_count: upsertedCount,
    deleted_count: toDelete.length,
    revalidated,
  };
}
