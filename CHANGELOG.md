# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), versi mengikuti
[Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added
- Homepage publik: section "Tenaga Medis Kami" (grid kartu foto + nama + spesialisasi dokter),
  melengkapi S2 yang sudah didefinisikan di Wireframe tapi belum diimplementasikan.

### Changed
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
