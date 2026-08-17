import type { UpdateJadwalInput } from "./jadwal.schema";

// Response sukses — dikutip langsung TSD §4.3
export interface UpdateJadwalResponse {
  success: true;
  updated_count: number;
  revalidated: boolean;
}

export type { UpdateJadwalInput };
