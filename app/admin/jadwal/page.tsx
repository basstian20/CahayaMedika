import { createServerSupabaseClient } from "@/lib/supabase/server";
import JadwalForm from "@/components/admin/JadwalForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { UpdateJadwalInput } from "@/lib/modules/jadwal/jadwal.types";

const HARI = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;

export const dynamic = "force-dynamic";

// Revisi dari versi single-dokter (cuma dokterList[0]) — sekarang membangun
// baris jadwal untuk SEMUA dokter dalam satu payload. fn_update_jadwal_dan_riwayat
// (migrasi 0006) sudah didesain menerima array lintas dokter_id dalam satu
// transaction (ON CONFLICT per dokter_id+hari), jadi ini bukan perubahan skema/RPC,
// cuma memperluas data yang dikirim dari halaman admin.
export default async function AdminJadwalPage() {
  const supabase = await createServerSupabaseClient();
  const { data: dokterList } = await supabase.from("dokter").select("id, nama").order("urutan");
  const { data: jadwalExisting } = await supabase
    .from("jadwal_praktik")
    .select("dokter_id, hari, jam_mulai, jam_selesai");

  const initialJadwal: UpdateJadwalInput["jadwal"] = (dokterList ?? []).flatMap((dokter) =>
    HARI.map((hari) => {
      const existing = jadwalExisting?.find((j) => j.hari === hari && j.dokter_id === dokter.id);
      return {
        dokter_id: dokter.id,
        hari,
        jam_mulai: existing?.jam_mulai?.slice(0, 5) ?? "08:00",
        jam_selesai: existing?.jam_selesai?.slice(0, 5) ?? "20:00",
      };
    })
  );

  const dokterMap: Record<string, string> = Object.fromEntries(
    (dokterList ?? []).map((d) => [d.id, d.nama])
  );

  return (
    <main className="min-h-screen bg-latar font-body">
      <AdminHeader backHref="/admin" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
          Edit Jadwal Dokter
        </h1>
        {initialJadwal.length > 0 ? (
          <JadwalForm initialJadwal={initialJadwal} dokterMap={dokterMap} />
        ) : (
          <p className="text-sm italic text-nakhoda/50">
            Belum ada dokter. Tambahkan dokter dulu di halaman Edit Profil Dokter.
          </p>
        )}
      </div>
    </main>
  );
}
