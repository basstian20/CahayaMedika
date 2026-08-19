"use client";

import { useState } from "react";
import Image from "next/image";
import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { UpdateDokterInput } from "@/lib/modules/dokter/dokter.types";
import { useUploadFotoDokter } from "@/hooks/useUploadFotoDokter";

interface DokterListEditorProps {
  control: Control<UpdateDokterInput>;
  register: UseFormRegister<UpdateDokterInput>;
  disabled: boolean;
  fotoUrlById: Record<string, string | null>;
}

// Pola sama dengan LayananListEditor: item existing dengan _delete: true tetap
// di array form (bukan remove()) supaya payload PATCH membawa flag-nya.
// Beda dari layanan: tiap baris dokter punya widget upload foto sendiri,
// dan foto cuma bisa diunggah untuk dokter yang sudah punya id (tersimpan) —
// dokter baru harus disimpan dulu sebelum foto-nya bisa diunggah.
export function DokterListEditor({ control, register, disabled, fotoUrlById }: DokterListEditorProps) {
  const { fields, append, remove, update } = useFieldArray({ control, name: "dokter" });

  function markForDelete(index: number) {
    const current = fields[index];
    if (current.id) {
      update(index, { ...current, _delete: true });
    } else {
      remove(index);
    }
  }

  return (
    <div className="space-y-4">
      {fields.map((field, index) =>
        field._delete ? null : (
          <div key={field.id} className="rounded-xl bg-white p-4 shadow-card">
            <DokterFotoField dokterId={field.id} initialFotoUrl={field.id ? fotoUrlById[field.id] ?? null : null} disabled={disabled} />

            <label className="mb-1 block text-sm font-medium text-nakhoda">Nama</label>
            <input
              {...register(`dokter.${index}.nama`)}
              disabled={disabled}
              className="mb-3 w-full rounded-xl border border-nakhoda/20 px-3 py-2 focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
            />
            <label className="mb-1 block text-sm font-medium text-nakhoda">Spesialisasi</label>
            <input
              {...register(`dokter.${index}.spesialisasi`)}
              disabled={disabled}
              className="mb-4 w-full rounded-xl border border-nakhoda/20 px-3 py-2 focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
            />

            <button
              type="button"
              onClick={() => markForDelete(index)}
              disabled={disabled}
              className="min-h-[44px] rounded-xl border border-error px-4 text-sm font-medium text-error disabled:opacity-40"
            >
              Hapus
            </button>
          </div>
        )
      )}
      <button
        type="button"
        onClick={() =>
          append({
            nama: "",
            spesialisasi: "",
            urutan: fields.length,
            _delete: false,
          })
        }
        disabled={disabled}
        className="min-h-[44px] w-full rounded-xl border-2 border-dashed border-nakhoda/30 px-4 text-sm font-medium text-nakhoda disabled:opacity-40"
      >
        + Tambah Dokter
      </button>
    </div>
  );
}

interface DokterFotoFieldProps {
  dokterId: string | undefined;
  initialFotoUrl: string | null;
  disabled: boolean;
}

function DokterFotoField({ dokterId, initialFotoUrl, disabled }: DokterFotoFieldProps) {
  const { upload, status, errorMessage, fotoUrl } = useUploadFotoDokter();
  const [preview, setPreview] = useState(initialFotoUrl);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !dokterId) return;
    void upload(dokterId, file).then(() => {
      if (fotoUrl) setPreview(fotoUrl);
    });
  }

  return (
    <div className="mb-3">
      <label className="mb-2 block text-sm font-medium text-nakhoda">Foto Profil</label>
      {(preview || fotoUrl) && (
        <Image
          src={fotoUrl ?? preview ?? ""}
          alt="Foto profil dokter"
          width={80}
          height={80}
          className="mb-2 h-20 w-20 rounded-xl object-cover"
        />
      )}
      {dokterId ? (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled || status === "uploading"}
        />
      ) : (
        <p className="text-xs italic text-nakhoda/50">Simpan dulu sebelum bisa upload foto.</p>
      )}
      {status === "error" && errorMessage && (
        <p role="alert" className="mt-1 text-xs text-error">
          {errorMessage}
        </p>
      )}
      {status === "success" && (
        <p role="status" className="mt-1 text-xs text-jaga">
          Foto berhasil diunggah.
        </p>
      )}
    </div>
  );
}
