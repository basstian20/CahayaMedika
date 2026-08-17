import { createServerSupabaseClient } from "@/lib/supabase/server";
import LayananForm from "@/components/admin/LayananForm";
import type { UpdateLayananInput } from "@/lib/modules/layanan/layanan.types";

export const dynamic = "force-dynamic";

export default async function AdminLayananPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("layanan").select("*").order("urutan");

  const initialLayanan: UpdateLayananInput["layanan"] = (data ?? []).map((l) => ({
    id: l.id,
    nama: l.nama,
    deskripsi: l.deskripsi ?? "",
    urutan: l.urutan,
    tampil_di_homepage: l.tampil_di_homepage,
    _delete: false,
  }));

  return (
    <main className="min-h-screen bg-latar px-6 py-10 font-body">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
          Edit Info Layanan
        </h1>
        <LayananForm
          initialLayanan={
            initialLayanan.length > 0
              ? initialLayanan
              : [{ nama: "", deskripsi: "", urutan: 0, tampil_di_homepage: true, _delete: false }]
          }
        />
      </div>
    </main>
  );
}
