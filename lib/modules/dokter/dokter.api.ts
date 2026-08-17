import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateDokterInput, UpdateDokterResponse } from "./dokter.types";

// dokter_id wajib ada di body — endpoint ini single-record, BUKAN batch (beda dari layanan).
export async function updateDokterRequest(
  input: UpdateDokterInput
): Promise<UpdateDokterResponse> {
  return fetchJson<UpdateDokterResponse>("/api/admin/dokter", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
