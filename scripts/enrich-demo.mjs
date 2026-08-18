// One-off enrichment script — memperbaiki data placeholder yang sudah ada
// (alamat "Contoh", 1 dokter, jadwal identik 7 hari) jadi lebih representatif
// untuk demo portofolio. Idempotent secara kasar: cek nama sebelum insert
// supaya aman dijalankan ulang tanpa duplikasi.
//
// Jalankan: node --env-file=.env.local scripts/enrich-demo.mjs
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

async function updateKlinikInfo() {
  const { data: rows, error } = await supabase.from("klinik_info").select("id, alamat").limit(1);
  if (error) throw error;
  if (!rows || rows.length === 0) {
    console.log("klinik_info kosong, dilewati (jalankan seed-demo.mjs dulu).");
    return;
  }
  const row = rows[0];
  if (!row.alamat.includes("Contoh")) {
    console.log("klinik_info sudah bukan placeholder, skip.");
    return;
  }
  const { error: updErr } = await supabase
    .from("klinik_info")
    .update({
      alamat: "Jl. Melati Raya No. 12, Kebayoran Baru, Jakarta Selatan",
      telepon: "628111234567",
      koordinat_lat: -6.2441,
      koordinat_lng: 106.7991,
      tahun_berdiri: 2015,
    })
    .eq("id", row.id);
  if (updErr) throw updErr;
  console.log("klinik_info diperbarui (alamat placeholder diganti).");
}

async function tambahLayanan() {
  const { data: existing, error } = await supabase.from("layanan").select("nama");
  if (error) throw error;
  const nama = new Set((existing ?? []).map((l) => l.nama));
  const tambahan = [
    {
      nama: "Konsultasi Anak",
      deskripsi: "Pemeriksaan tumbuh kembang dan kesehatan anak oleh dokter berpengalaman.",
      urutan: 4,
    },
    {
      nama: "Pemeriksaan Gigi",
      deskripsi: "Perawatan dan pemeriksaan kesehatan gigi & mulut.",
      urutan: 5,
    },
  ].filter((l) => !nama.has(l.nama));

  if (tambahan.length === 0) {
    console.log("layanan sudah lengkap, skip.");
    return;
  }
  const { error: insErr } = await supabase.from("layanan").insert(tambahan);
  if (insErr) throw insErr;
  console.log(`layanan ditambah (${tambahan.length} item baru).`);
}

async function perbaikiJadwalAyu() {
  const { data: ayu, error } = await supabase.from("dokter").select("id").eq("nama", "dr. Ayu Pratiwi").maybeSingle();
  if (error) throw error;
  if (!ayu) {
    console.log("dr. Ayu Pratiwi tidak ditemukan, skip perbaikan jadwal.");
    return;
  }
  const { data: jadwalMinggu } = await supabase
    .from("jadwal_praktik")
    .select("hari, jam_mulai")
    .eq("dokter_id", ayu.id)
    .eq("hari", "minggu")
    .maybeSingle();

  if (!jadwalMinggu) {
    console.log("Jadwal dr. Ayu sudah tidak identik 7 hari, skip.");
    return;
  }

  // Realistis: Senin-Jumat jam kerja penuh, Sabtu setengah hari, Minggu libur.
  await supabase.from("jadwal_praktik").delete().eq("dokter_id", ayu.id).eq("hari", "minggu");
  await supabase
    .from("jadwal_praktik")
    .update({ jam_mulai: "08:00", jam_selesai: "16:00" })
    .eq("dokter_id", ayu.id)
    .in("hari", ["senin", "selasa", "rabu", "kamis", "jumat"]);
  await supabase
    .from("jadwal_praktik")
    .update({ jam_mulai: "08:00", jam_selesai: "13:00" })
    .eq("dokter_id", ayu.id)
    .eq("hari", "sabtu");
  console.log("Jadwal dr. Ayu diperbaiki jadi realistis (libur Minggu, Sabtu setengah hari).");
}

async function tambahDokterDanJadwal() {
  const { data: existing, error } = await supabase.from("dokter").select("id, nama");
  if (error) throw error;
  const namaSet = new Set((existing ?? []).map((d) => d.nama));

  const kandidat = [
    { nama: "dr. Bagus Santoso, Sp.A", spesialisasi: "Spesialis Anak", urutan: 2 },
    { nama: "drg. Citra Dewi", spesialisasi: "Dokter Gigi", urutan: 3 },
  ].filter((d) => !namaSet.has(d.nama));

  if (kandidat.length === 0) {
    console.log("Dokter tambahan sudah ada, skip.");
    return;
  }

  const { data: inserted, error: insErr } = await supabase.from("dokter").insert(kandidat).select("id, nama");
  if (insErr) throw insErr;
  console.log(`dokter ditambah (${inserted.length} item baru).`);

  const jadwalRows = [];
  for (const d of inserted) {
    const isDokterGigi = d.nama.startsWith("drg.");
    const hariKerja = isDokterGigi
      ? ["selasa", "kamis", "sabtu"]
      : ["senin", "selasa", "rabu", "kamis", "jumat"];
    for (const hari of hariKerja) {
      jadwalRows.push({
        dokter_id: d.id,
        hari,
        jam_mulai: isDokterGigi ? "10:00" : "09:00",
        jam_selesai: isDokterGigi ? "17:00" : "15:00",
      });
    }
  }
  const { error: jadwalErr } = await supabase.from("jadwal_praktik").insert(jadwalRows);
  if (jadwalErr) throw jadwalErr;
  console.log(`jadwal_praktik ditambah (${jadwalRows.length} baris).`);
}

async function main() {
  await updateKlinikInfo();
  await tambahLayanan();
  await perbaikiJadwalAyu();
  await tambahDokterDanJadwal();
  console.log("\nSelesai memperkaya data demo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
