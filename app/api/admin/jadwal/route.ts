import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { updateJadwalSchema } from "@/lib/modules/jadwal/jadwal.schema";
import { updateJadwal } from "@/lib/modules/jadwal/jadwal.service";
import { ValidationError } from "@/lib/shared/errors";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const body = await req.json();
    const parsed = updateJadwalSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Payload jadwal tidak valid.");
    }

    const result = await updateJadwal(parsed.data, adminId);
    return { data: result };
  });
}
