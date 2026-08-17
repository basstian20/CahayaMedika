import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleRoute } from "@/lib/shared/response";
import { listRiwayat } from "@/lib/modules/riwayat/riwayat.service";

// Route ini selalu bergantung pada cookies (requireAdmin) — tidak bisa
// diprerender statis.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleRoute(async () => {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20") || 20));

    const result = await listRiwayat(page, limit);
    // Bentuk response TSD §4.3 tidak dibungkus { success, ... } biasa —
    // ini sudah { data, page, has_more } secara langsung, jadi status 200 saja.
    // handleRoute tetap membungkus lewat successResponse, hasil aktual jadi
    // { success: true, data: [...], page, has_more } — deviasi aditif yang
    // diterima final (Endpoints Spec item terbuka #6).
    return { data: result as unknown as Record<string, unknown> };
  });
}
