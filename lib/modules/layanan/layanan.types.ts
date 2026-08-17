import type { UpdateLayananInput } from "./layanan.schema";

export interface UpdateLayananResponse {
  success: true;
  updated_count: number;
  deleted_count: number;
  revalidated: boolean;
}

export type { UpdateLayananInput };
