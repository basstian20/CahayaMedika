import { getKlinikInfo, getJadwalPublik } from "@/lib/modules/klinik-info/klinik-info.repository";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

// Server Component tipis — fetch data yang sama dengan homepage publik
// (klinik_info + jadwal_praktik, RLS select-anon) supaya Indikator Cahaya di
// dashboard (S6) menunjukkan status yang identik dengan yang dilihat pasien
// (UI Template Spec §6). Perhitungan buka/tutup tetap di client via
// useKlinikStatus (TSD §3.3).
export default async function AdminDashboardPage() {
  const [klinikInfo, jadwal] = await Promise.all([getKlinikInfo(), getJadwalPublik()]);

  const jadwalMingguIni = jadwal.map((j) => ({
    hari: j.hari,
    jam_mulai: j.jam_mulai.slice(0, 5),
    jam_selesai: j.jam_selesai.slice(0, 5),
  }));

  return (
    <AdminDashboard
      jadwalMingguIni={jadwalMingguIni}
      jamOperasionalDefault={klinikInfo?.jam_operasional_default}
    />
  );
}
