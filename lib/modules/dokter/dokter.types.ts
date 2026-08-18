import type { UpdateDokterInput } from "./dokter.schema";

export interface UpdateDokterResponse {
  success: true;
  updated_count: number;
  deleted_count: number;
  revalidated: boolean;
}

export type { UpdateDokterInput };
