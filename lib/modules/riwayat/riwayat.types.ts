export interface RiwayatEntry {
  id: string;
  admin_email: string;
  jenis_perubahan: string;
  ringkasan: string;
  created_at: string;
}

// Response TSD §4.3 + koreksi: envelope { success: true, data, page, has_more }
export interface RiwayatResponse {
  success: true;
  data: RiwayatEntry[];
  page: number;
  has_more: boolean;
}
