"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateDokterSchema } from "@/lib/modules/dokter/dokter.schema";
import type { UpdateDokterInput } from "@/lib/modules/dokter/dokter.types";
import { useUpdateDokter } from "@/lib/modules/dokter/useUpdateDokter";
import { DokterListEditor } from "./DokterListEditor";

interface DokterFormProps {
  initialDokter: UpdateDokterInput["dokter"];
  fotoUrlById: Record<string, string | null>;
}

export default function DokterForm({ initialDokter, fotoUrlById }: DokterFormProps) {
  const { register, handleSubmit, control } = useForm<UpdateDokterInput>({
    resolver: zodResolver(updateDokterSchema),
    defaultValues: { dokter: initialDokter },
  });
  const { save, status, errorMessage } = useUpdateDokter();

  const onSubmit = handleSubmit((values) => save(values));

  return (
    <form onSubmit={onSubmit} className="font-body">
      <DokterListEditor
        control={control}
        register={register}
        disabled={status === "saving"}
        fotoUrlById={fotoUrlById}
      />

      {status === "success" && (
        <p role="status" className="mt-4 rounded-xl bg-jaga/10 p-3 text-sm text-jaga">
          Data dokter berhasil disimpan.
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
        {status === "saving" ? "Menyimpan..." : "Simpan Semua Dokter"}
      </button>
    </form>
  );
}
