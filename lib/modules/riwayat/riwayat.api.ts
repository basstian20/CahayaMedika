import { fetchJson } from "@/lib/api/fetch-json";
import type { RiwayatResponse } from "./riwayat.types";

export async function fetchRiwayatRequest(page: number, limit: number): Promise<RiwayatResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  // TIDAK ada filter tanggal — sesuai keputusan UX §5 poin 6.
  return fetchJson<RiwayatResponse>(`/api/admin/riwayat?${params.toString()}`);
}
