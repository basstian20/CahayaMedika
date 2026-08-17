import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { uploadFotoSchema } from "@/lib/modules/dokter/dokter.schema";
import { uploadFotoDokter } from "@/lib/modules/dokter/dokter-foto.service";
import { ValidationError } from "@/lib/shared/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const { adminId } = await requireAdmin();

    const formData = await req.formData();
    const dokterId = formData.get("dokter_id");
    const file = formData.get("file");

    const parsed = uploadFotoSchema.safeParse({ dokter_id: dokterId });
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "dokter_id tidak valid.");
    }
    if (!(file instanceof File)) {
      throw new ValidationError("Field 'file' wajib berupa file upload.");
    }

    const result = await uploadFotoDokter(file, parsed.data.dokter_id, adminId);
    return { data: result };
  });
}
