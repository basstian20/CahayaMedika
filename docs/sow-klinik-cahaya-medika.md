# Statement of Work — Landing Page Klinik Cahaya Medika

> **Catatan konteks:** Dokumen ini adalah draft template internal, diturunkan dari PRD "Landing Page Klinik Cahaya Medika" v1.1. Klinik Cahaya Medika adalah proyek ilustrasi/konsep, bukan klien nyata — nilai dan jadwal di bawah ini adalah contoh yang masuk akal untuk scope ini, bukan rate card final Noble Dev. Sebelum dipakai ke klien real, ganti seluruh placeholder dan verifikasi ulang angka terhadap kapasitas kerja aktual.

| Field | Detail |
|---|---|
| Referensi PRD | Landing Page Klinik Cahaya Medika, v1.1 |
| Pemberi Jasa | Noble Dev |
| Klien | Klinik Cahaya Medika *(ilustratif)* |
| Model Harga | Fixed-price |
| Total Nilai Proyek | Rp 15.000.000 *(ilustratif — sesuaikan dengan rate card aktual)* |
| Status | Draft — Template Internal |

---

## 1. Project Overview

Statement of Work ini merujuk pada **PRD Landing Page Klinik Cahaya Medika v1.1**, mencakup pembangunan landing page satu halaman (dengan beberapa section) untuk sebuah klinik keluarga, dioptimalkan untuk pencarian lokal, dilengkapi CTA WhatsApp sebagai kanal kontak utama, serta panel admin ringan agar pemilik klinik dapat memperbarui jadwal dokter dan info layanan secara mandiri. Seluruh scope, fitur, dan target teknis pada dokumen ini mengikuti apa yang telah disepakati di PRD tersebut.

## 2. Deliverables

Yang diserahkan pada akhir engagement, dalam kondisi siap pakai:

- Homepage lengkap dengan hero section, CTA WhatsApp yang selalu terlihat tanpa scroll, dan ringkasan 3–4 layanan unggulan
- Halaman/section Info Layanan & Profil Klinik, terisi dengan konten final dari klien (daftar layanan, profil dokter/tenaga medis)
- Tabel jadwal dokter mingguan yang tampil otomatis dari data admin, dengan indikator status "Buka sekarang"/"Tutup" real-time
- Halaman/section Kontak & Lokasi — WhatsApp click-to-chat, Google Maps embed, nomor telepon, dan alamat lengkap
- Structured data (schema.org LocalBusiness/MedicalClinic) terpasang dan tervalidasi lolos Google Rich Results Test
- Panel admin ringan yang berfungsi (1 akun), untuk update mandiri jadwal dokter dan info layanan, lengkap dengan log riwayat perubahan dasar
- Dokumentasi penggunaan admin panel (panduan singkat + visual)
- Sesi training singkat untuk pemilik klinik (target ≤15 menit, tanpa perlu latar belakang teknis)

## 3. Exclusions

Berikut **tidak** termasuk dalam scope proyek ini:

- Sistem booking online penuh (manajemen slot janji temu)
- Rekam medis pasien / integrasi EMR
- Portal pasien (login pasien, riwayat kunjungan)
- Manajemen multi-cabang/multi-lokasi
- Pembayaran online / integrasi BPJS-asuransi
- Blog / artikel kesehatan (content marketing)
- Versi multi-bahasa (Inggris)

Semua item di atas bisa dikerjakan sebagai fase lanjutan terpisah, di luar SOW ini.

## 4. Schedule & Milestones

Estimasi total: **~5.5–6.5 minggu** kerja (lihat rincian per-fase di tabel di bawah), terhitung sejak konten final klien diterima (lihat Client Responsibilities). Phase 1 adalah critical path — seluruh fase berikutnya terblokir sampai konten terkonfirmasi.

> **Catatan konsistensi:** PRD §8 menyebut estimasi ringkas "~4–5 minggu" untuk keseluruhan build. Tabel milestone mingguan di bawah ini lebih rinci per-fase dan menjumlah ke ~5.5–6.5 minggu — angka pada dokumen ini (SOW) yang dipakai sebagai acuan komitmen jadwal ke klien, karena granularitasnya lebih tinggi. Selisih ini juga sudah diwariskan secara eksplisit ke Timeline & Milestones Document §9, yang menambahkan buffer kontingensi di atas angka SOW ini (total ~6.5 minggu + buffer). PRD §8 sebaiknya direvisi mengikuti angka ini agar tidak lagi jadi sumber kebingungan bagi pembaca yang hanya membaca satu dokumen.

| Minggu | Fase | Deliverable Milestone | Payment Trigger |
|---|---|---|---|
| 1 | Discovery & Content Audit | Konten layanan, jadwal, foto, copy terkonfirmasi | 30% saat kickoff |
| 2 | Desain & Struktur Halaman | Wireframe low-fi disetujui | — |
| 3–4.5 | Development Frontend + Structured Data | Homepage, Info Layanan, Jadwal, Kontak selesai dibangun; structured data terpasang; siap didemokan | 40% saat demo mid-project |
| 4.5–5.5 | Admin/CMS Ringan | Panel admin berfungsi, auth aktif | — |
| 5.5–6 | QA, Aksesibilitas & Performance | Lighthouse audit lolos target NFR | — |
| 6–6.5 | Launch & Handover | Live di domain klien, training selesai | 30% saat serah terima final |

## 5. Payment Terms

**Model harga: Fixed-price**, total **Rp 15.000.000** *(ilustratif untuk template ini)*, dibayarkan dalam 3 tahap:

| Tahap | Persentase | Jumlah | Trigger |
|---|---|---|---|
| 1 | 30% | Rp 4.500.000 | Saat kontrak ditandatangani / kickoff proyek |
| 2 | 40% | Rp 6.000.000 | Saat modul frontend (homepage, layanan, jadwal, kontak) selesai dan didemokan, dengan structured data terpasang |
| 3 | 30% | Rp 4.500.000 | Saat serah terima final & klien menerima (acceptance) |

Pembayaran dilakukan lewat transfer bank ke rekening Noble Dev *(detail rekening: [ISI])*, maksimal 3 hari kerja setelah invoice diterbitkan pada tiap tahap.

## 6. Client Responsibilities

- **Konten final** (daftar layanan, deskripsi, jadwal dokter, foto profil, alamat, jam operasional) harus diberikan **selambat-lambatnya akhir Minggu 1**. Keterlambatan menggeser seluruh timeline berikutnya sesuai jumlah hari keterlambatan.
- **Akses/registrasi domain** (jika belum ada) harus tersedia sebelum fase Launch (Minggu 6).
- Klien menunjuk **1 kontak person** yang bisa dihubungi untuk klarifikasi cepat selama proses development.
- **Feedback/persetujuan pada tiap milestone demo** diberikan maksimal **3 hari kerja**, agar tidak menghambat fase berikutnya.

## 7. Change Request Process

Segala permintaan di luar Deliverables/Exclusions pada dokumen ini — termasuk namun tidak terbatas pada fitur di daftar Exclusions — akan di-scope, diberi estimasi biaya dan waktu terpisah, dan memerlukan persetujuan tertulis dari klien sebelum dikerjakan. Perubahan scope tidak dikerjakan secara informal di tengah proyek tanpa proses ini.

## 8. Acceptance Criteria

| Deliverable | Kriteria "Selesai" |
|---|---|
| Homepage & CTA WhatsApp | CTA dapat diklik dan membuka chat WA, terlihat tanpa scroll di breakpoint 360px/768px/1280px |
| Structured data | Lolos validasi Google Rich Results Test tanpa error |
| Panel admin | Pemilik klinik dapat login, update jadwal dokter, dan melihat perubahan tampil di halaman publik secara mandiri dalam ≤5 menit per update, diverifikasi lewat sesi handover |
| Performance | LCP homepage ≤2.5 detik pada simulasi 4G, diverifikasi lewat Lighthouse audit |
| Aksesibilitas | Kontras warna memenuhi WCAG AA (≥4.5:1), ukuran font dasar ≥16px |

## 9. Ketentuan Lain

`[Per standar Master Service Agreement Noble Dev — kepemilikan IP, garansi, tanggung jawab, dan penyelesaian sengketa tidak dirancang di dokumen ini]`

## 10. Sign-Off

| | Noble Dev | Klien — Klinik Cahaya Medika |
|---|---|---|
| Nama | [ISI] | [ISI] |
| Jabatan | [ISI] | Pemilik/Direktur |
| Tanda Tangan | ___________ | ___________ |
| Tanggal | [ISI] | [ISI] |
