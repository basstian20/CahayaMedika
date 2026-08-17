import { upsertLayanan, deleteLayanan } from "./layanan.repository";
import { catatPerubahan } from "@/lib/modules/riwayat/riwayat.service";
import { revalidatePublicHomepage } from "@/lib/revalidation/revalidate-public";
import type { UpdateLayananInput } from "./layanan.schema";

export async function updateLayanan(input: UpdateLayananInput, adminId: string) {
  const toDelete = input.layanan.filter((item) => item._delete && item.id);
  const toUpsert = input.layanan.filter((item) => !item._delete);

  if (toDelete.length > 0) {
    await deleteLayanan(toDelete.map((item) => item.id as string));
  }
  const { upsertedCount } = await upsertLayanan(toUpsert);

  await catatPerubahan(
    adminId,
    "layanan",
    `Update ${upsertedCount} layanan, hapus ${toDelete.length} layanan`
  );

  const revalidated = await revalidatePublicHomepage();

  return {
    updated_count: upsertedCount,
    deleted_count: toDelete.length,
    revalidated,
  };
}
