# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), versi mengikuti
[Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added
- Homepage publik: section "Tenaga Medis Kami" (grid kartu foto + nama + spesialisasi dokter),
  melengkapi S2 yang sudah didefinisikan di Wireframe tapi belum diimplementasikan.
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
