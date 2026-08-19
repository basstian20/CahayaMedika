import { z } from "zod";

// Revisi dari [ASUMSI] semula di Endpoints Spec §4.3 ("scope-nya satu dokter
// per panggilan") — dikunci ulang jadi batch list, mengikuti pola `layanan`
// (id opsional untuk item baru, _delete untuk hapus), supaya admin bisa
// mengelola semua dokter yang tampil di homepage publik (S2), bukan cuma satu.
const dokterItemSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, "nama wajib diisi.").max(120),
  spesialisasi: z.string().min(1, "spesialisasi wajib diisi.").max(120),
  urutan: z.number().int().min(0),
  _delete: z.boolean().optional().default(false),
});

export const updateDokterSchema = z.object({
  dokter: z.array(dokterItemSchema).min(1, "Minimal satu entri dokter wajib dikirim."),
});

export type UpdateDokterInput = z.infer<typeof updateDokterSchema>;

// Dipakai oleh endpoint upload foto — file size & MIME whitelist,
// menutup risiko TSD §9 baris "Upload foto dokter tanpa validasi ketat"
export const uploadFotoSchema = z.object({
  dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
});

export const MAX_FOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — [ASUMSI, lihat Endpoints Spec item terbuka #4]
export const ALLOWED_FOTO_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

// Sumber kebenaran ekstensi storage path — JANGAN turunkan ekstensi dari
// file.name (client-controlled, bisa berisi "/" atau ".." di request mentah
// di luar browser). Dipetakan dari MIME yang sudah divalidasi validateFoto().
export const FOTO_MIME_TO_EXT: Record<(typeof ALLOWED_FOTO_MIME)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
