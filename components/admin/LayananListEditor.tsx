"use client";

import { useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import type { UpdateLayananInput } from "@/lib/modules/layanan/layanan.types";

interface LayananListEditorProps {
  control: Control<UpdateLayananInput>;
  register: UseFormRegister<UpdateLayananInput>;
  disabled: boolean;
}

// Wireframe S8: list editable dengan tombol tambah/hapus per baris. Item
// existing dengan _delete: true TETAP di array form (bukan remove()) supaya
// payload PATCH mengandung flag-nya (Frontend Logic §5.1).
export function LayananListEditor({ control, register, disabled }: LayananListEditorProps) {
  const { fields, append, remove, update } = useFieldArray({ control, name: "layanan" });

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
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-nakhoda/50">
              Layanan {index + 1}
            </p>
            <label className="mb-1 block text-sm font-medium text-nakhoda">Nama Layanan</label>
            <input
              {...register(`layanan.${index}.nama`)}
              disabled={disabled}
              className="mb-3 w-full rounded-xl border border-nakhoda/20 px-3 py-2 focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
            />
            <label className="mb-1 block text-sm font-medium text-nakhoda">Deskripsi</label>
            <textarea
              {...register(`layanan.${index}.deskripsi`)}
              disabled={disabled}
              rows={2}
              className="mb-3 w-full rounded-xl border border-nakhoda/20 px-3 py-2 focus:border-cahaya focus:outline-none focus:ring-2 focus:ring-cahaya"
            />
            <label className="mb-3 flex items-center gap-2 text-sm text-nakhoda">
              <input
                type="checkbox"
                {...register(`layanan.${index}.tampil_di_homepage`)}
                disabled={disabled}
                className="h-4 w-4 accent-cahaya"
              />
              Tampilkan di homepage
            </label>
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
            deskripsi: "",
            urutan: fields.length,
            tampil_di_homepage: true,
            _delete: false,
          })
        }
        disabled={disabled}
        className="min-h-[44px] w-full rounded-xl border-2 border-dashed border-nakhoda/30 px-4 text-sm font-medium text-nakhoda disabled:opacity-40"
      >
        + Tambah Layanan
      </button>
    </div>
  );
}
