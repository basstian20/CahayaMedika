import { getKlinikInfo, getJadwalPublik } from "@/lib/modules/klinik-info/klinik-info.repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

// Server Component tipis — fetch data yang sama dengan homepage publik
// (klinik_info + jadwal_praktik, RLS select-anon) supaya Indikator Cahaya di
// dashboard (S6) menunjukkan status yang identik dengan yang dilihat pasien
// (UI Template Spec §6). Perhitungan buka/tutup tetap di client via
// useKlinikStatus (TSD §3.3). Query layanan/dokter di bawah pakai session-scoped
// client (pola yang sama dengan app/admin/(panel)/layanan,dokter/page.tsx) untuk
// ringkasan kartu dashboard — bukan repository publik karena butuh semua baris,
// bukan cuma yang tampil_di_homepage.
export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const [klinikInfo, jadwal, { data: layanan }, { data: dokter }] = await Promise.all([
    getKlinikInfo(),
    getJadwalPublik(),
    supabase.from("layanan").select("id, nama, tampil_di_homepage").order("urutan"),
    supabase.from("dokter").select("id, nama, foto_url").order("urutan"),
  ]);

  const jadwalMingguIni = jadwal.map((j) => ({
    hari: j.hari,
    jam_mulai: j.jam_mulai.slice(0, 5),
    jam_selesai: j.jam_selesai.slice(0, 5),
  }));

  return (
    <AdminDashboard
      jadwalMingguIni={jadwalMingguIni}
      jamOperasionalDefault={klinikInfo?.jam_operasional_default}
      layanan={layanan ?? []}
      dokter={dokter ?? []}
    />
  );
}
