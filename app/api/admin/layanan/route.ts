import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { updateLayananSchema } from "@/lib/modules/layanan/layanan.schema";
import { updateLayanan } from "@/lib/modules/layanan/layanan.service";
import { ValidationError } from "@/lib/shared/errors";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const body = await req.json();
    const parsed = updateLayananSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Payload layanan tidak valid.");
    }

    const result = await updateLayanan(parsed.data, adminId);
    return { data: result };
  });
}
