import { z } from "zod";

// [ASUMSI] field & shape mengikuti Blueprint §4 modul Layanan (nama, deskripsi,
// urutan, tampil_di_homepage) — bukan dikutip dari TSD §4.3 karena tidak ada di sana.
// `id` opsional: hadir untuk item existing (update), absen untuk item baru (insert).
// `_delete: true` menandai item yang harus dihapus — pola batch yang sama dengan jadwal.
const layananItemSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(1, "nama layanan wajib diisi.").max(120),
  deskripsi: z.string().max(1000).optional().default(""),
  urutan: z.number().int().min(0),
  tampil_di_homepage: z.boolean(),
  _delete: z.boolean().optional().default(false),
});

export const updateLayananSchema = z.object({
  layanan: z.array(layananItemSchema).min(1, "Minimal satu entri layanan wajib dikirim."),
});

export type UpdateLayananInput = z.infer<typeof updateLayananSchema>;
