"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDokterSchema } from "@/lib/modules/dokter/dokter.schema";
import type { UpdateDokterInput } from "@/lib/modules/dokter/dokter.types";
import { useUpdateDokter } from "@/lib/modules/dokter/useUpdateDokter";
import { useUploadFotoDokter } from "@/hooks/useUploadFotoDokter";

interface DokterFormProps {
  initialDokter: UpdateDokterInput;
  fotoUrl: string | null;
}

export default function DokterForm({ initialDokter, fotoUrl }: DokterFormProps) {
  const { register, handleSubmit } = useForm<UpdateDokterInput>({
    resolver: zodResolver(updateDokterSchema),
    defaultValues: initialDokter,
  });
  const { save, status, errorMessage } = useUpdateDokter();
  const { upload, status: uploadStatus, errorMessage: uploadError, fotoUrl: uploadedUrl } =
    useUploadFotoDokter();
  const [preview, setPreview] = useState(fotoUrl);

  const onSubmit = handleSubmit((values) => save(values));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void upload(initialDokter.dokter_id, file).then(() => {
      if (uploadedUrl) setPreview(uploadedUrl);
    });
  }

  return (
    <div className="space-y-6 font-body">
      <div className="rounded-xl bg-white p-4 shadow-card">
        <label className="mb-2 block text-sm font-medium text-nakhoda">Foto Profil</label>
        {(preview || uploadedUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={uploadedUrl ?? preview ?? ""}
            alt="Foto profil dokter"
            className="mb-3 h-24 w-24 rounded-xl object-cover"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploadStatus === "uploading"}
        />
        {uploadStatus === "error" && uploadError && (
          <p role="alert" className="mt-2 text-sm text-error">
            {uploadError}
          </p>
        )}
        {uploadStatus === "success" && (
          <p role="status" className="mt-2 text-sm text-jaga">
            Foto berhasil diunggah.
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="rounded-xl bg-white p-4 shadow-card">
        <label className="mb-1 block text-sm font-medium text-nakhoda">Nama</label>
        <input
          {...register("nama")}
          disabled={status === "saving"}
          className="mb-3 w-full rounded-xl border border-nakhoda/20 px-3 py-2 focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
        />
        <label className="mb-1 block text-sm font-medium text-nakhoda">Spesialisasi</label>
        <input
          {...register("spesialisasi")}
          disabled={status === "saving"}
          className="mb-4 w-full rounded-xl border border-nakhoda/20 px-3 py-2 focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
        />

        {status === "success" && (
          <p role="status" className="mb-3 text-sm text-jaga">
            Profil dokter berhasil disimpan.
          </p>
        )}
        {(status === "error" || status === "not_found") && errorMessage && (
          <p role="alert" className="mb-3 text-sm text-error">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "saving"}
          className="min-h-[44px] w-full rounded-xl bg-nakhoda px-4 py-3 font-medium text-latar disabled:opacity-40"
        >
          {status === "saving" ? "Menyimpan..." : "Simpan Profil Dokter"}
        </button>
      </form>
    </div>
  );
}
