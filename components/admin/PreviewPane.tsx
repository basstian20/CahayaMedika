import type { ReactNode } from "react";

// Wrapper untuk kolom pratinjau di sisi form edit (jadwal/layanan/dokter) —
// label eksplisit supaya admin tidak salah kira ini halaman publik yang live.
// Isi preview dibaca dari nilai form yang belum disimpan (useWatch), bukan
// fetch ulang ke server.
export function PreviewPane({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-nakhoda/20 bg-latar p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-nakhoda/50">
        Pratinjau Tampilan Publik
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
