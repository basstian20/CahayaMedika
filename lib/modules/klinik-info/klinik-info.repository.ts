import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { InternalError } from "@/lib/shared/errors";
import type { KlinikInfo, LayananPublik, DokterPublik, JadwalPublik } from "./klinik-info.types";

// Read-only, dipanggil langsung dari Server Component app/(public)/page.tsx
// saat generation/revalidation — anon client TANPA cookies (public.ts) + RLS
// SELECT publik (TSD §4.1), supaya halaman tetap bisa di-generate sebagai
// SSG + on-demand ISR (TSD §3.3-3.4), bukan server-rendered per-request.
// Status "Buka Sekarang"/"Tutup" TIDAK dihitung di sini — dihitung client-side
// dari data mentah jadwal (TSD §3.3, lib/public/useKlinikStatus.ts).

export async function getKlinikInfo(): Promise<KlinikInfo | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.from("klinik_info").select("*").limit(1).maybeSingle();
  if (error) throw new InternalError(`Gagal mengambil info klinik: ${error.message}`);
  return data as KlinikInfo | null;
}

export async function getLayananPublik(): Promise<LayananPublik[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("layanan")
    .select("id, nama, deskripsi, urutan")
    .eq("tampil_di_homepage", true)
    .order("urutan", { ascending: true });
  if (error) throw new InternalError(`Gagal mengambil layanan: ${error.message}`);
  return (data ?? []) as LayananPublik[];
}

export async function getDokterPublik(): Promise<DokterPublik[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("dokter")
    .select("id, nama, spesialisasi, foto_url, urutan")
    .order("urutan", { ascending: true });
  if (error) throw new InternalError(`Gagal mengambil data dokter: ${error.message}`);
  return (data ?? []) as DokterPublik[];
}

export async function getJadwalPublik(): Promise<JadwalPublik[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("jadwal_praktik")
    .select("id, dokter_id, hari, jam_mulai, jam_selesai");
  if (error) throw new InternalError(`Gagal mengambil jadwal praktik: ${error.message}`);
  return (data ?? []) as JadwalPublik[];
}
