import { createServerSupabaseClient } from "@/lib/supabase/server";
import JadwalForm from "@/components/admin/JadwalForm";
import type { UpdateJadwalInput } from "@/lib/modules/jadwal/jadwal.types";

const HARI = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;

export const dynamic = "force-dynamic";

// Server Component — query langsung jadwal_praktik untuk mengisi defaultValues
// form (Frontend Logic §4: "dari Server Component parent").
export default async function AdminJadwalPage() {
  const supabase = createServerSupabaseClient();
  const { data: dokterList } = await supabase.from("dokter").select("id").order("urutan");
  const { data: jadwalExisting } = await supabase
    .from("jadwal_praktik")
    .select("dokter_id, hari, jam_mulai, jam_selesai");

  const dokterId = dokterList?.[0]?.id as string | undefined;

  const initialJadwal: UpdateJadwalInput["jadwal"] = HARI.map((hari) => {
    const existing = jadwalExisting?.find((j) => j.hari === hari && j.dokter_id === dokterId);
    return {
      dokter_id: dokterId ?? "",
      hari,
      jam_mulai: existing?.jam_mulai?.slice(0, 5) ?? "08:00",
      jam_selesai: existing?.jam_selesai?.slice(0, 5) ?? "20:00",
    };
  });

  return (
    <main className="min-h-screen bg-latar px-6 py-10 font-body">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
          Edit Jadwal Dokter
        </h1>
        <JadwalForm initialJadwal={initialJadwal} />
      </div>
    </main>
  );
}
