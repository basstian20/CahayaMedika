import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { updateDokterSchema } from "@/lib/modules/dokter/dokter.schema";
import { updateDokter } from "@/lib/modules/dokter/dokter.service";
import { ValidationError } from "@/lib/shared/errors";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const body = await req.json();
    const parsed = updateDokterSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Payload dokter tidak valid.");
    }

    const result = await updateDokter(parsed.data, adminId);
    return { data: result };
  });
}
