# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), versi mengikuti
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
