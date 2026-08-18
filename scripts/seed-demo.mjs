// One-off seed script untuk data demo portofolio + akun admin demo publik.
// Pakai service_role (reserved-use, Backend Blueprint §8: "operasional non-bisnis,
// tooling internal") — BUKAN dipanggil dari path aplikasi mana pun.
//
// Jalankan: node --env-file=.env.local scripts/seed-demo.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Butuh NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "admin-demo@cahayamedika.id";
const DEMO_PASSWORD = "DemoCahaya2026!";

async function ensureDemoUser() {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    console.log(`Akun demo sudah ada: ${DEMO_EMAIL}`);
    return existing;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Akun demo dibuat: ${DEMO_EMAIL}`);
  return data.user;
}

async function ensureKlinikInfo() {
  const { data: existing, error: selErr } = await supabase.from("klinik_info").select("id").limit(1);
  if (selErr) throw selErr;
  if (existing && existing.length > 0) {
    console.log("klinik_info sudah ada, skip.");
    return;
  }
  const { error } = await supabase.from("klinik_info").insert({
    nama: "Klinik Cahaya Medika",
    alamat: "Jl. Melati Raya No. 12, Kebayoran Baru, Jakarta Selatan",
    telepon: "628111234567",
    koordinat_lat: -6.2441,
    koordinat_lng: 106.7991,
    tahun_berdiri: 2014,
    jam_operasional_default: { jam_mulai: "08:00", jam_selesai: "20:00" },
  });
  if (error) throw error;
  console.log("klinik_info diisi.");
}

async function ensureLayanan() {
  const { data: existing, error: selErr } = await supabase.from("layanan").select("id").limit(1);
  if (selErr) throw selErr;
  if (existing && existing.length > 0) {
    console.log("layanan sudah ada, skip.");
    return;
  }
  const rows = [
    {
      nama: "Pemeriksaan Umum",
      deskripsi: "Konsultasi dan pemeriksaan kesehatan umum untuk seluruh anggota keluarga.",
      urutan: 1,
    },
    {
      nama: "Konsultasi Anak",
      deskripsi: "Pemeriksaan tumbuh kembang dan kesehatan anak oleh dokter berpengalaman.",
      urutan: 2,
    },
    {
      nama: "Vaksinasi",
      deskripsi: "Layanan imunisasi lengkap sesuai jadwal vaksinasi nasional.",
      urutan: 3,
    },
    {
      nama: "Pemeriksaan Gigi",
      deskripsi: "Perawatan dan pemeriksaan kesehatan gigi & mulut.",
      urutan: 4,
    },
    {
      nama: "Cek Laboratorium",
      deskripsi: "Pemeriksaan darah, urine, dan tes laboratorium dasar lainnya.",
      urutan: 5,
    },
  ];
  const { error } = await supabase.from("layanan").insert(rows);
  if (error) throw error;
  console.log(`layanan diisi (${rows.length} item).`);
}

async function ensureDokterDanJadwal() {
  const { data: existing, error: selErr } = await supabase.from("dokter").select("id").limit(1);
  if (selErr) throw selErr;
  if (existing && existing.length > 0) {
    console.log("dokter sudah ada, skip (jadwal juga di-skip).");
    return;
  }
  const dokterRows = [
    { nama: "dr. Amelia Putri", spesialisasi: "Dokter Umum", urutan: 1 },
    { nama: "dr. Bagus Santoso, Sp.A", spesialisasi: "Spesialis Anak", urutan: 2 },
    { nama: "drg. Citra Dewi", spesialisasi: "Dokter Gigi", urutan: 3 },
  ];
  const { data: inserted, error } = await supabase.from("dokter").insert(dokterRows).select("id, nama");
  if (error) throw error;
  console.log(`dokter diisi (${inserted.length} item).`);

  const hariKerja = ["senin", "selasa", "rabu", "kamis", "jumat"];
  const jadwalRows = [];
  for (const d of inserted) {
    for (const hari of hariKerja) {
      jadwalRows.push({ dokter_id: d.id, hari, jam_mulai: "08:00", jam_selesai: "16:00" });
    }
  }
  const citra = inserted.find((d) => d.nama.includes("Citra"));
  if (citra) {
    jadwalRows.push({ dokter_id: citra.id, hari: "sabtu", jam_mulai: "09:00", jam_selesai: "13:00" });
  }

  const { error: jadwalError } = await supabase.from("jadwal_praktik").insert(jadwalRows);
  if (jadwalError) throw jadwalError;
  console.log(`jadwal_praktik diisi (${jadwalRows.length} baris).`);
}

async function main() {
  await ensureDemoUser();
  await ensureKlinikInfo();
  await ensureLayanan();
  await ensureDokterDanJadwal();
  console.log("\nSelesai. Login demo admin:");
  console.log(`  URL   : /admin/login`);
  console.log(`  Email : ${DEMO_EMAIL}`);
  console.log(`  Pass  : ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
