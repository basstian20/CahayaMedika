import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateDokterInput, UpdateDokterResponse } from "./dokter.types";

// Batch, sama seperti layanan — lihat dokter.schema.ts untuk shape { dokter: [...] }.
export async function updateDokterRequest(
  input: UpdateDokterInput
): Promise<UpdateDokterResponse> {
  return fetchJson<UpdateDokterResponse>("/api/admin/dokter", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
