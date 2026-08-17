import { fetchFormData } from "@/lib/api/fetch-json";
import type { UploadFotoResponse } from "./dokter-foto.types";

export async function uploadFotoDokterRequest(
  dokterId: string,
  file: File
): Promise<UploadFotoResponse> {
  const formData = new FormData();
  formData.append("dokter_id", dokterId);
  formData.append("file", file);
  return fetchFormData<UploadFotoResponse>("/api/admin/dokter/foto", formData);
}
