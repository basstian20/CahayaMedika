import { z } from "zod";

// [ASUMSI] field mengikuti Blueprint §4 modul Dokter ("nama, spesialisasi") —
// urutan juga disertakan karena ada di data model TSD §5.1.
export const updateDokterSchema = z.object({
  dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
  nama: z.string().min(1, "nama wajib diisi.").max(120),
  spesialisasi: z.string().min(1, "spesialisasi wajib diisi.").max(120),
  urutan: z.number().int().min(0).optional(),
});

export type UpdateDokterInput = z.infer<typeof updateDokterSchema>;

// Dipakai oleh endpoint upload foto — file size & MIME whitelist,
// menutup risiko TSD §9 baris "Upload foto dokter tanpa validasi ketat"
export const uploadFotoSchema = z.object({
  dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
});

export const MAX_FOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — [ASUMSI, lihat Endpoints Spec item terbuka #4]
export const ALLOWED_FOTO_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
