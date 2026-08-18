"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateJadwalSchema } from "@/lib/modules/jadwal/jadwal.schema";
import type { UpdateJadwalInput } from "@/lib/modules/jadwal/jadwal.types";
import { useUpdateJadwal } from "@/lib/modules/jadwal/useUpdateJadwal";

interface JadwalFormProps {
  initialJadwal: UpdateJadwalInput["jadwal"];
  dokterMap: Record<string, string>;
}

const HARI_LABEL: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

// Revisi dari versi single-dokter — satu form sekarang mengirim jadwal untuk
// semua dokter sekaligus (array flat `jadwal` tetap sama di level data/RPC,
// cuma dikelompokkan per dokter di tampilan lewat dokterMap).
export default function JadwalForm({ initialJadwal, dokterMap }: JadwalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateJadwalInput>({
    resolver: zodResolver(updateJadwalSchema),
    defaultValues: { jadwal: initialJadwal },
  });

  const { fields } = useFieldArray({ control, name: "jadwal" });
  const { save, status, errorMessage } = useUpdateJadwal();

  const onSubmit = handleSubmit((values) => save(values));

  // Kelompokkan baris flat per dokter_id untuk tampilan — index asli di
  // `fields` tetap dipakai untuk path register (`jadwal.${index}.*`) supaya
  // payload submit tetap array flat sesuai kontrak fn_update_jadwal_dan_riwayat.
  const dokterIds = Array.from(new Set(fields.map((f) => f.dokter_id)));

  return (
    <form onSubmit={onSubmit} className="font-body">
      <div className="space-y-6">
        {dokterIds.map((dokterId) => (
          <div key={dokterId} className="overflow-x-auto rounded-xl bg-white shadow-card">
            <h2 className="border-b border-nakhoda/10 p-4 font-display font-semibold text-nakhoda">
              {dokterMap[dokterId] ?? "Dokter"}
            </h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-nakhoda/10 font-mono text-xs uppercase text-nakhoda/60">
                  <th className="p-4">Hari</th>
                  <th className="p-4">Jam Mulai</th>
                  <th className="p-4">Jam Selesai</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) =>
                  field.dokter_id !== dokterId ? null : (
                    <tr key={field.id} className="border-b border-nakhoda/5 last:border-0">
                      <td className="p-4 font-medium text-nakhoda">
                        {HARI_LABEL[field.hari] ?? field.hari}
                      </td>
                      <td className="p-4">
                        <input
                          type="time"
                          {...register(`jadwal.${index}.jam_mulai`)}
                          disabled={status === "saving"}
                          className="min-h-[44px] rounded-xl border border-nakhoda/20 px-3 py-2 font-mono text-sm tabular-nums focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
                        />
                        {errors.jadwal?.[index]?.jam_mulai && (
                          <span role="alert" className="mt-1 block text-xs text-error">
                            {errors.jadwal[index]?.jam_mulai?.message}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <input
                          type="time"
                          {...register(`jadwal.${index}.jam_selesai`)}
                          disabled={status === "saving"}
                          className="min-h-[44px] rounded-xl border border-nakhoda/20 px-3 py-2 font-mono text-sm tabular-nums focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
                        />
                        {errors.jadwal?.[index]?.jam_selesai && (
                          <span role="alert" className="mt-1 block text-xs text-error">
                            {errors.jadwal[index]?.jam_selesai?.message}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {status === "success" && (
        <p role="status" className="mt-4 rounded-xl bg-jaga/10 p-3 text-sm text-jaga">
          Jadwal berhasil diperbarui.
        </p>
      )}
      {status === "error" && errorMessage && (
        <p role="alert" className="mt-4 rounded-xl bg-error/10 p-3 text-sm text-error">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="sticky bottom-4 mt-4 min-h-[44px] w-full rounded-xl bg-nakhoda px-4 py-3 font-medium text-latar disabled:opacity-40"
      >
        {status === "saving" ? "Menyimpan..." : "Simpan Jadwal"}
      </button>
    </form>
  );
}
