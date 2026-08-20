import { createServerSupabaseClient } from "@/lib/supabase/server";
import DokterForm from "@/components/admin/DokterForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { UpdateDokterInput } from "@/lib/modules/dokter/dokter.types";

export const dynamic = "force-dynamic";

// Revisi dari versi single-dokter (`.limit(1)`) — sekarang mengelola semua
// dokter yang tampil di homepage publik S2, bukan cuma yang pertama.
export default async function AdminDokterPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("dokter").select("*").order("urutan");

  const initialDokter: UpdateDokterInput["dokter"] = (data ?? []).map((d) => ({
    id: d.id,
    nama: d.nama,
    spesialisasi: d.spesialisasi,
    urutan: d.urutan,
    _delete: false,
  }));

  const fotoUrlById: Record<string, string | null> = Object.fromEntries(
    (data ?? []).map((d) => [d.id, d.foto_url ?? null])
  );

  return (
    <main className="min-h-screen bg-latar font-body">
      <AdminHeader backHref="/admin" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
          Edit Profil Dokter
        </h1>
        <DokterForm
          initialDokter={
            initialDokter.length > 0
              ? initialDokter
              : [{ nama: "", spesialisasi: "", urutan: 0, _delete: false }]
          }
          fotoUrlById={fotoUrlById}
        />
      </div>
    </main>
  );
}
