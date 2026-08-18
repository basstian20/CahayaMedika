# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), versi mengikuti
[Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added
- Homepage publik: hero dipecah jadi grid 2 kolom (teks + panel visual) mengikuti pola
  `docs/design.html`, dengan CTA sekunder "Lihat Layanan" mendampingi CTA WhatsApp utama
  (UI Template Spec §5 Tombol Sekunder).
- Panel visual hero jadi slideshow fasilitas layanan (`components/public/HeroSlideshow.tsx`,
  4 foto asli ruang klinik — ruang tunggu keluarga, ruang konsultasi dokter, ruang bermain
  anak, apotek & ruang obat — menggantikan ikon placeholder awal begitu foto asli tersedia).
  Auto-rotate 4.5s adalah pengecualian motion kedua di luar glow Indikator Cahaya — dicatat
  sebagai revisi eksplisit di UI Template Spec §3 Motion, berhenti otomatis saat pointer/fokus
  di atas panel dan saat `prefers-reduced-motion` aktif. Navigasi panah + dot semuanya
  bertarget sentuh 44×44px (UI Template Spec §7).
- Badge kepercayaan diperluas dari 2 ke 4 kolom (strip berbingkai ala `design.html`): tahun
  berdiri, jumlah dokter, dan jam operasional dihitung dari data asli; "500+ Pasien dilayani"
  ditambahkan sebagai angka ilustratif khusus konteks portofolio (CLAUDE.md §0 — bukan proyek
  klien nyata), disetujui eksplisit oleh pemilik proyek.
- Section Layanan/Dokter/Jadwal dapat eyebrow label + heading rata kiri, konsisten dengan pola
  section header `design.html`.
- Section Kontak & Lokasi (S4) dapat `components/public/KlinikStatusPanel.tsx` — Indikator
  Cahaya + jam praktik hari ini ditampilkan besar di atas latar gelap, meniru blok status di
  `design.html`. `IndikatorCahaya` dapat prop `onDark` baru karena ini pemakaian pertama
  elemen signature ini di atas latar gelap (dot/glow tidak berubah, hanya warna label teks).
- Header dapat CTA WhatsApp pill compact (`WhatsAppButton` prop `size`/`label` baru) di
  sebelah nomor telepon, supaya konversi tetap mudah tanpa scroll — nomor telepon disembunyikan
  di breakpoint mobile (`md:inline`) supaya header tidak sesak.
- Homepage publik: section "Tenaga Medis Kami" (kartu foto + nama + spesialisasi dokter),
  melengkapi S2 yang sudah didefinisikan di Wireframe tapi belum diimplementasikan. Kartu
  memakai foto asli tiap dokter (`foto_url` dari Supabase Storage bucket `dokter-foto`,
  diunggah lewat `scripts/seed-demo.mjs`) dan jadwal praktik mingguan tiap dokter digabung
  langsung ke dalam kartu masing-masing, menggantikan tabel "Jadwal Dokter Mingguan" (S3)
  yang sebelumnya terpisah — keputusan eksplisit pemilik proyek, menyimpang dari pola
  "Baris Tabel Jadwal" di UI Template Spec §5.
- QA visual & aksesibilitas dengan Playwright (CLAUDE.md §9): `.mcp.json` registrasi Playwright
  MCP, `playwright.config.ts`, dan test nyata pertama `tests/admin/login-accessibility.spec.ts`
  (kontras WCAG AA via axe-core, target sentuh 44×44px, fokus keyboard — UI Template Spec §7).
  Scoped ke `/admin/login` karena satu-satunya route yang tidak butuh koneksi Supabase untuk
  render. Bukan pengganti test suite bisnis-logic formal, yang statusnya tetap sengaja terbuka.
- `npm run typecheck` (`tsc --noEmit`) — type check cepat tanpa perlu kredensial Supabase,
  melengkapi `next build` (yang tetap jadi hard gate resmi, Deployment Plan §3).
- Data demo untuk portofolio: `scripts/seed-demo.mjs` (akun admin demo publik + data awal
  jika kosong) dan `scripts/enrich-demo.mjs` (memperkaya data placeholder yang sudah ada jadi
  lebih representatif — 3 dokter dengan spesialisasi & jadwal berbeda, 5 layanan, alamat
  klinik non-placeholder). Keduanya pakai `service_role` sebagai tooling internal
  reserved-use (Backend Blueprint §8), idempotent (aman dijalankan ulang).
### Changed
- **Revisi keputusan Endpoints Spec §4.3** ("scope-nya satu dokter per panggilan" untuk modul
  Dokter): admin sekarang bisa mengelola SEMUA dokter (tambah/edit/hapus + jadwal per dokter),
  bukan cuma dokter pertama. `app/admin/dokter` & `app/admin/jadwal` diperluas dari single-record
  ke batch list, mengikuti pola yang sudah ada di modul `layanan` (`dokter.schema.ts`,
  `.service.ts`, `.repository.ts` sekarang array-based dengan `_delete` flag; `JadwalForm`
  mengelompokkan baris per dokter, memakai kapasitas batch `fn_update_jadwal_dan_riwayat` yang
  memang sudah didesain menerima banyak `dokter_id` sekaligus). Ini keputusan sadar milik
  pemilik proyek yang menimpa `[ASUMSI]` semula, dicatat di sini sebagai revisi eksplisit.
- README: tambah pitch ringkas untuk audiens portofolio (kenapa proyek ini ada, sorotan
  teknis, status terbuka apa adanya) di bagian atas, tanpa mengubah bagian setup/struktur
  yang sudah ada.
### Fixed
- Inkonsistensi jam operasional: trust-strip "Jam operasional" di Badge Kepercayaan menampilkan
  `jam_operasional_default` statis apa pun harinya, sementara Indikator Cahaya (status buka/tutup)
  dihitung dari `jadwal_praktik` hari itu — bisa tampil kontradiktif di halaman yang sama.
  Trust-strip sekarang reuse `useKlinikStatus` lewat `JamOperasionalHariIni.tsx` supaya sinkron
  dengan status live; `jam_operasional_default` tetap fallback sesuai desain awal (TSD §5.3).
- Status buka/tutup klinik saat beberapa dokter praktik di hari yang sama dengan jam berbeda:
  `useKlinikStatus` sebelumnya pakai `.find()` yang mengambil jadwal dokter pertama secara acak
  dari query `jadwal_praktik` tak terurut. Sekarang dihitung sebagai rentang gabungan (jam_mulai
  terawal, jam_selesai terakhir dari semua dokter hari itu) lewat `gabungkanJadwalHari()`.
- Kartu dokter: foto dr. Bagus Santoso terpotong di bagian kepala karena kontainer foto
  avatar bujur sangkar (1:1, `h-32 w-32`) memaksa crop foto sumber berformat potret (~3:4).
  Kontainer diganti `aspect-[3/4]` + `object-top` supaya rasio nyaris sama persis dengan
  foto sumber — sekaligus jadi dasar redesain kartu jadi lebih besar (foto full-width di
  atas kartu, bukan avatar kecil di tengah).
- Bug batch upsert `dokter` & `layanan`: satu panggilan `.upsert()` atas array campuran
  (ada item baru tanpa `id`, ada item existing dengan `id`) membuat PostgREST mengirim
  `id: null` eksplisit untuk item baru, melanggar NOT NULL constraint. Ditemukan lewat uji
  end-to-end nambah dokter baru berdampingan dengan dokter existing di panel admin (bukan
  ditebak) — sekarang insert & update dipisah jadi 2 panggilan di `dokter.repository.ts` dan
  `layanan.repository.ts`.
- Design token (warna, tipografi, radius) disinkronkan sebagian dengan referensi desain
  eksternal `docs/design.html`: `color-nakhoda`/`color-cahaya`/`color-latar`/`color-jaga`
  pindah ke nilai OKLCH baru, font display+body diganti dari Fraunces+Plus Jakarta Sans
  ke Figtree, radius kartu/tombol/input dari 12px ke 16px. Token tanpa padanan di
  `design.html` (CTA WhatsApp, status "Tutup", error form) serta struktur konten klinik
  keluarga dipertahankan tidak berubah (UI Template Spec, catatan revisi 2026-08-18).
- Homepage publik (S1–S4) direstyle mengikuti pola layout `docs/design.html` dalam batas
  struktur wireframe yang sudah dikonfirmasi (User Flow & Wireframe §5 poin 3): header
  dapat nav anchor link, hero dapat eyebrow pill "Klinik Keluarga · Sejak [tahun]", badge
  kepercayaan direstyle jadi strip berbingkai (hanya fakta nyata dari data — tahun berdiri
  & jam operasional, tanpa angka pasien/sertifikasi fiktif), kartu layanan & dokter dapat
  border + icon swatch, section Kontak & Lokasi direstyle jadi dark band (`bg-nakhoda`)
  menyatukan alamat, CTA WA/telepon, dan peta.

## [0.1.0] - 2026-08-17
### Added
- Scaffold awal proyek: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase.
- Homepage publik (S1–S4): hero, ringkasan layanan, badge kepercayaan, jadwal dokter mingguan,
  kontak & lokasi, Indikator Cahaya (PRD §4 Modul 1, 4).
- Panel admin (S5–S9): login, dashboard hub, edit jadwal, edit layanan, edit profil dokter +
  upload foto, riwayat perubahan (PRD §4 Modul 2, 3, 6).
- 5 endpoint admin (`PATCH jadwal`, `PATCH layanan`, `PATCH dokter`, `POST dokter/foto`,
  `GET riwayat`) dengan Zod validation, session-scoped Supabase client, response envelope
  standar (Endpoints Implementation Spec).
- Migrasi database 0001–0006 (klinik_info, layanan, dokter, jadwal_praktik, riwayat_perubahan,
  fn_update_jadwal_dan_riwayat RPC) dengan RLS policy per tabel (Backend Blueprint §6).
