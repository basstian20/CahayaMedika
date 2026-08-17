import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateLayananInput, UpdateLayananResponse } from "./layanan.types";

export async function updateLayananRequest(
  input: UpdateLayananInput
): Promise<UpdateLayananResponse> {
  return fetchJson<UpdateLayananResponse>("/api/admin/layanan", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
