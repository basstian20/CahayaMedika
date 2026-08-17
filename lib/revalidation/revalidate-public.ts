import { revalidatePath } from "next/cache";
import { logger } from "@/lib/shared/logger";

// Membungkus revalidatePath('/') dalam try-catch — kegagalan TIDAK menggagalkan
// response sukses ke admin (write DB tetap dianggap berhasil), tapi tercatat di
// log untuk investigasi/retry manual. Keputusan final Blueprint §10.1 poin 4,
// mengimplementasikan mitigasi TSD §9 baris pertama.
export async function revalidatePublicHomepage(): Promise<boolean> {
  try {
    revalidatePath("/");
    logger.info("revalidate.success", { path: "/" });
    return true;
  } catch (err) {
    logger.error("revalidate.failed", { path: "/", error: String(err) });
    return false;
  }
}
