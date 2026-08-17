import { z } from "zod";

// Sesuai request body TSD §4.3 — dokter_id (uuid), hari (enum Senin-Minggu),
// jam_mulai/jam_selesai (format waktu valid HH:mm)
const HARI = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const jadwalItemSchema = z
  .object({
    dokter_id: z.string().uuid({ message: "dokter_id harus berupa UUID valid." }),
    hari: z.enum(HARI, { errorMap: () => ({ message: "hari harus salah satu dari Senin-Minggu." }) }),
    jam_mulai: z.string().regex(TIME_REGEX, "jam_mulai harus format HH:mm."),
    jam_selesai: z.string().regex(TIME_REGEX, "jam_selesai harus format HH:mm."),
  })
  .refine((val) => val.jam_mulai < val.jam_selesai, {
    message: "jam_mulai harus lebih awal dari jam_selesai.",
    path: ["jam_selesai"],
  });

export const updateJadwalSchema = z.object({
  jadwal: z.array(jadwalItemSchema).min(1, "Minimal satu entri jadwal wajib dikirim."),
});

export type UpdateJadwalInput = z.infer<typeof updateJadwalSchema>;
