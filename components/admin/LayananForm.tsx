"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateLayananSchema } from "@/lib/modules/layanan/layanan.schema";
import type { UpdateLayananInput } from "@/lib/modules/layanan/layanan.types";
import { useUpdateLayanan } from "@/lib/modules/layanan/useUpdateLayanan";
import { LayananListEditor } from "./LayananListEditor";

interface LayananFormProps {
  initialLayanan: UpdateLayananInput["layanan"];
}

export default function LayananForm({ initialLayanan }: LayananFormProps) {
  const { register, handleSubmit, control } = useForm<UpdateLayananInput>({
    resolver: zodResolver(updateLayananSchema),
    defaultValues: { layanan: initialLayanan },
  });
  const { save, status, errorMessage } = useUpdateLayanan();

  const onSubmit = handleSubmit((values) => save(values));

  return (
    <form onSubmit={onSubmit} className="font-body">
      <LayananListEditor control={control} register={register} disabled={status === "saving"} />

      {status === "success" && (
        <p role="status" className="mt-4 rounded-xl bg-jaga/10 p-3 text-sm text-jaga">
          Layanan berhasil disimpan.
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
        {status === "saving" ? "Menyimpan..." : "Simpan Layanan"}
      </button>
    </form>
  );
}
