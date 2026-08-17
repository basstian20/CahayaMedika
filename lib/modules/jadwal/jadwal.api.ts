import { fetchJson } from "@/lib/api/fetch-json";
import type { UpdateJadwalInput, UpdateJadwalResponse } from "./jadwal.types";

export async function updateJadwalRequest(input: UpdateJadwalInput): Promise<UpdateJadwalResponse> {
  return fetchJson<UpdateJadwalResponse>("/api/admin/jadwal", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
