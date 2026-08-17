import { createServerSupabaseClient } from "@/lib/supabase/server";
import DokterForm from "@/components/admin/DokterForm";

export const dynamic = "force-dynamic";

export default async function AdminDokterPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("dokter").select("*").order("urutan").limit(1).maybeSingle();

  return (
    <main className="min-h-screen bg-latar px-6 py-10 font-body">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
          Edit Profil Dokter
        </h1>
        <DokterForm
          initialDokter={{
            dokter_id: data?.id ?? "",
            nama: data?.nama ?? "",
            spesialisasi: data?.spesialisasi ?? "",
            urutan: data?.urutan,
          }}
          fotoUrl={data?.foto_url ?? null}
        />
      </div>
    </main>
  );
}
