# Project Requirement Document — Landing Page Klinik Cahaya Medika

> **Catatan konteks:** Dokumen ini disusun dari studi kasus konsep "Klinik Cahaya Medika" (proyek ilustrasi portofolio Noble Dev, bukan klien nyata). PRD ini dibuat sebagai draft internal / template kerja yang bisa dipakai ulang untuk proyek landing page bisnis jasa sejenis (klinik, bimbel, biro jasa) yang butuh self-service content update ringan.
>
> **Changelog v1.1:** §8 Total Estimasi direvisi dari "~4–5 minggu" menjadi "~5.5–6.5 minggu" untuk menyelaraskan dengan tabel jadwal mingguan rinci di SOW §4 (yang sebelumnya berbeda dari klaim ringkas PRD ini). Tidak ada perubahan scope/fitur — murni koreksi estimasi durasi.

## Cover Block

| Field | Detail |
|---|---|
| Nama Proyek | Landing Page Klinik Cahaya Medika |
| Versi Dokumen | v1.1 |
| Status | Draft — Template Internal |
| Target Pasar | Indonesia (Bahasa Indonesia, primer) |
| Disusun oleh | Noble Dev |
| Tingkat Dokumen | Standard |
| Total Modul | 6 |
| Total Role Pengguna | 2 |

## Daftar Isi

1. Executive Summary
2. Product Scope & Goals
3. User Roles & Personas
4. Feature Requirements
5. Key User Flows
6. Recommended Technology Stack
7. Non-Functional Requirements
8. Development Build Order & Milestones
9. Risks & Mitigations
10. Appendix

---

## 1. Executive Summary

**Vision statement.** Landing page yang menjadikan kehadiran digital klinik selengkap dan setepercaya reputasi klinik di dunia nyata — titik kontak pertama yang meyakinkan calon pasien untuk menghubungi, bukan sekadar halaman profil.

**Problem statement.** Klinik sudah punya basis pasien loyal dari mulut ke mulut, tapi nyaris tidak terlihat saat calon pasien baru mencari lewat Google/Maps. Tidak ada halaman yang menjelaskan layanan, jadwal dokter, atau cara menghubungi secara jelas — sehingga klinik kalah bersaing di pencarian lokal meski kualitas layanannya tidak kalah.

**Proposed solution.** Landing page satu halaman (dengan beberapa section) yang dioptimalkan untuk pencarian lokal (structured data), CTA WhatsApp yang selalu terlihat, serta panel admin ringan supaya pemilik klinik bisa memperbarui jadwal dan info layanan sendiri tanpa bergantung ke developer.

## 2. Product Scope & Goals

### In Scope (MVP)

| # | Modul | Prioritas |
|---|---|---|
| 1 | Halaman Utama (Homepage) | Must-have |
| 2 | Info Layanan & Profil Klinik | Must-have |
| 3 | Jadwal & Jam Operasional | Must-have |
| 4 | Kontak & Lokasi | Must-have |
| 5 | SEO & Structured Data | Must-have |
| 6 | Admin/CMS Ringan | Must-have |

### Out of Scope (Post-MVP)

- Sistem booking online penuh (manajemen slot janji temu)
- Rekam medis pasien / integrasi EMR
- Portal pasien (login, riwayat kunjungan)
- Manajemen multi-cabang/multi-lokasi
- Pembayaran online / integrasi BPJS-asuransi
- Blog / artikel kesehatan (content marketing)
- Versi multi-bahasa (Inggris)

### Success Metrics

*Catatan: target di bawah adalah target desain/teknis yang bisa diverifikasi lewat QA sebelum dan sesudah launch — bukan proyeksi hasil bisnis (traffic/konversi aktual), karena itu baru bisa diukur setelah klinik nyata berjalan.*

| Target | Tolok Ukur |
|---|---|
| CTA WhatsApp terlihat tanpa scroll di homepage | QA visual, semua breakpoint utama |
| LCP homepage ≤ 2.5 detik | Core Web Vitals "Good" threshold — [asumsi: standar industri, bukan janji ke klien] |
| Structured data lolos validasi | Google Rich Results Test — pass 100% |
| Admin dapat update jadwal tanpa bantuan developer | Diuji lewat sesi handover, waktu ≤5 menit per update |

## 3. User Roles & Personas

**Admin (Pemilik Klinik)** — David-type persona: pemilik bisnis mapan, tidak tech-savvy, skeptis ke solusi yang "cantik tapi tidak fungsional". Bisa: login ke panel admin, update jadwal dokter, update info layanan/jam operasional, lihat riwayat perubahan sederhana.

**Pengunjung / Calon Pasien** — Mencari klinik lewat Google/Maps, sering dari HP, kadang dalam kondisi mendesak. Bisa: melihat info layanan, jadwal dokter, lokasi, dan menghubungi klinik lewat WhatsApp atau telepon.

## 4. Feature Requirements

*Role codes: **A** = Admin/Pemilik Klinik, **V** = Visitor/Calon Pasien*

### Modul 1 — Halaman Utama (Homepage)

Section pertama yang dilihat pengunjung; harus langsung menjawab "klinik ini bisa bantu saya atau tidak" dan menyediakan jalan tercepat untuk menghubungi.

| Fitur | Deskripsi | Role |
|---|---|---|
| Hero section + CTA WhatsApp | Value proposition singkat + tombol WA yang terlihat tanpa scroll | V |
| Ringkasan layanan unggulan | 3-4 layanan utama ditampilkan sebagai preview, link ke detail | V |
| Badge kepercayaan | Info faktual (tahun berdiri, jam operasional) — tanpa testimoni/rating fiktif | V |

### Modul 2 — Info Layanan & Profil Klinik

| Fitur | Deskripsi | Role |
|---|---|---|
| Daftar layanan | Disusun berdasarkan pertanyaan umum pasien baru, bukan daftar generik | V |
| Profil dokter/tenaga medis | Nama, spesialisasi, foto (jika tersedia) | V |
| Update konten layanan | Admin bisa edit teks/daftar layanan | A |

### Modul 3 — Jadwal & Jam Operasional

| Fitur | Deskripsi | Role |
|---|---|---|
| Tabel jadwal dokter mingguan | Tampil di halaman publik, auto-update dari data admin | V |
| Form update jadwal | Admin input/edit jadwal lewat panel sederhana | A |
| Indikator buka/tutup real-time | Status "Buka sekarang"/"Tutup" berdasarkan jam operasional hari ini | V |

### Modul 4 — Kontak & Lokasi

| Fitur | Deskripsi | Role |
|---|---|---|
| WhatsApp click-to-chat | CTA utama di seluruh halaman, bukan form booking kompleks | V |
| Google Maps embed | Lokasi klinik dengan petunjuk arah | V |
| Info kontak alternatif | Nomor telepon, alamat lengkap | V |

### Modul 5 — SEO & Structured Data

| Fitur | Deskripsi | Role |
|---|---|---|
| Schema.org LocalBusiness/MedicalClinic | Markup terstruktur untuk hasil pencarian Google | — (sistem) |
| Meta tag & OpenGraph | Judul, deskripsi, gambar share untuk tiap halaman | — (sistem) |
| Sitemap & robots.txt | Standar teknis untuk crawlability | — (sistem) |

### Modul 6 — Admin/CMS Ringan

| Fitur | Deskripsi | Role |
|---|---|---|
| Login admin | Autentikasi sederhana, 1 akun | A |
| Edit jadwal & info layanan | Form minimal, tanpa kompleksitas rich-text editor penuh | A |
| Riwayat perubahan dasar | Log siapa/kapan konten terakhir diubah | A |

## 5. Key User Flows

**Flow 1 — Pencarian ke Kontak (Visitor, jalur utama)**
Trigger: Cari "klinik terdekat" di Google → Landing di homepage → Baca ringkasan layanan → Klik CTA WhatsApp → Chat dengan klinik.
*3 langkah inti, tanpa friksi form.*

**Flow 2 — Update Jadwal Mandiri (Admin)**
Trigger: Jadwal dokter minggu ini berubah → Login ke panel admin → Edit jadwal → Simpan → Perubahan langsung tampil di halaman publik.
*4 langkah, tanpa bantuan developer.*

**Flow 3 — Kunjungan Mendesak (Visitor, mobile)**
Trigger: Butuh klinik segera dari HP → Cek status buka/tutup di homepage → Cek lokasi via Maps embed → Telepon atau WA langsung.
*3 langkah, dioptimalkan untuk koneksi lambat.*

## 6. Recommended Technology Stack

| Layer | Recommended | Alternatives | Rationale |
|---|---|---|---|
| Frontend | Next.js 14 (App Router), Static Generation + ISR | Astro, HTML+Tailwind statis | SSG memberi performa & SEO terbaik untuk landing page; ISR memungkinkan update konten (jadwal) tanpa rebuild manual penuh |
| Styling | Tailwind CSS | CSS/SCSS manual | Konsisten dengan design system Noble Dev, mempercepat build untuk proyek skala kecil |
| Data & Admin Auth | Supabase (tabel sederhana + Supabase Auth) | Headless CMS ringan (Sanity free tier) | Konsisten dengan stack internal Noble Dev, auth built-in cukup untuk 1 admin, biaya minimal di skala klinik kecil. Sanity jadi opsi jika ke depan butuh editor konten lebih kaya (banyak gambar/rich text) |
| Hosting | Vercel | Netlify | Native support Next.js, edge caching mempercepat load global, deployment simpel untuk maintain solo developer |
| Kanal Komunikasi | WhatsApp click-to-chat (tanpa API berbayar) | WhatsApp Cloud API | Cukup untuk volume klinik kecil-menengah; upgrade ke Cloud API jika volume pesan naik signifikan (fase lanjutan) |
| Analytics | Vercel Analytics / Google Analytics 4 | — | Memantau sumber trafik pencarian lokal tanpa biaya tambahan berarti |

> **Catatan lokal (Indonesia-facing):** Bahasa Indonesia sebagai bahasa UI utama, WhatsApp sebagai kanal komunikasi utama (bukan email/form), timezone Asia/Jakarta untuk jam operasional. Payment gateway (Midtrans/Xendit) **tidak berlaku** untuk MVP ini — tidak ada transaksi online dalam scope landing page ini, dicatat eksplisit agar jelas bukan terlewat, bukan sengaja diabaikan.

## 7. Non-Functional Requirements

### Performance

| Requirement | Target |
|---|---|
| LCP homepage | ≤ 2.5 detik pada simulasi 4G [Core Web Vitals "Good" threshold] |
| Total page weight homepage | ≤ 1.5MB termasuk gambar [asumsi — praktik umum landing page performant] |

### Security

| Requirement | Target |
|---|---|
| Autentikasi admin | Supabase Auth, email + password, 1 akun admin [asumsi sesuai skala 1 pemilik] |
| Data sensitif pasien | Tidak disimpan — landing page tidak mengumpulkan data kesehatan lewat form apa pun (data minimization by design) |
| Transport security | HTTPS wajib di seluruh halaman (default Vercel) |

### Reliability & Availability

| Requirement | Target |
|---|---|
| Uptime | 99.5% [standar umum static hosting, bukan SLA formal — confirm jika klien butuh SLA tertulis] |
| Backup konten | Riwayat perubahan tersimpan di Supabase [asumsi: retensi backup lanjutan perlu dikonfirmasi jika naik ke tier berbayar] |

### Usability & Accessibility

| Requirement | Target |
|---|---|
| Kontras warna | Minimum WCAG AA (rasio ≥4.5:1) |
| Ukuran font dasar | Minimum 16px untuk teks body — relevan untuk demografi pasien lintas usia |
| Responsive breakpoints | 360px, 768px, 1280px (mobile-first) |
| Kurva belajar admin panel | Bisa dioperasikan tanpa training teknis >15 menit |

## 8. Development Build Order & Milestones

| Phase | Modul | Deliverable Utama | Estimasi Durasi |
|---|---|---|---|
| 1 | Discovery & Content Audit | Konfirmasi info layanan, jadwal, foto, copy dari klien | 1 minggu |
| 2 | Desain & Struktur Halaman | Wireframe low-fi, struktur konten homepage/layanan/kontak | 1 minggu |
| 3 | Development Frontend + Structured Data | Build halaman Next.js, schema markup, integrasi WA CTA | 1.5 minggu |
| 4 | Admin/CMS Ringan | Setup Supabase, admin route, auth | 0.5–1 minggu |
| 5 | QA, Aksesibilitas & Performance | Lighthouse audit, testing lintas perangkat | 0.5 minggu |
| 6 | Launch & Handover | Dokumentasi admin, training singkat pemilik | 0.5 minggu |

**Total estimasi: ~5.5–6.5 minggu** (asumsi 1 developer, scope sesuai MVP di atas) — direvisi dari estimasi ringkas awal ("~4–5 minggu") di v1.0 agar konsisten dengan rincian tabel jadwal mingguan di SOW §4, yang merupakan acuan komitmen jadwal ke klien. Phase 1 (content audit) adalah **critical path** — seluruh fase berikutnya terblokir sampai konten dari klien terkonfirmasi.

## 9. Risks & Mitigations

| Risiko | Likelihood | Impact | Mitigasi |
|---|---|---|---|
| Klien lambat memberikan konten (foto, jadwal, copy) | Tinggi | Menunda seluruh timeline | Content checklist dikirim di awal Phase 1 dengan deadline jelas |
| Scope creep (klien minta booking system penuh di tengah jalan) | Sedang | Timeline & biaya membengkak | MVP boundary jelas + proses change request formal |
| Admin tidak terbiasa pakai panel | Sedang | Konten jadi usang (jadwal tidak update) | Panel didesain minimal (2-3 field), training singkat + dokumentasi visual |
| Structured data tidak tervalidasi dengan benar | Rendah-Sedang | SEO lokal tidak optimal | Validasi wajib via Google Rich Results Test sebelum launch |

## 10. Appendix

### Glossary

- **LCP (Largest Contentful Paint)** — metrik kecepatan render elemen konten terbesar di layar; indikator utama kecepatan muat halaman.
- **WCAG AA** — standar aksesibilitas web untuk kontras warna dan keterbacaan.
- **Structured Data / Schema.org** — markup data terstruktur yang membantu mesin pencari memahami konten halaman (jam buka, lokasi, dsb).
- **ISR (Incremental Static Regeneration)** — teknik Next.js untuk memperbarui halaman statis tanpa rebuild penuh.

### Prepared Deliverables (yang sudah ada)

- Studi kasus konsep "Klinik Cahaya Medika" (dokumen referensi konteks bisnis & keputusan desain)

### Next Steps (jika proyek ini menjadi engagement nyata)

- Konfirmasi konten final dari klien (layanan, jadwal, foto)
- Setup akun Vercel & Supabase project
- Registrasi domain (jika belum ada)
- Setup Google Business Profile terhubung dengan structured data
- Jadwalkan sesi handover & training admin panel
