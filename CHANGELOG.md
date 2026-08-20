# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), versi mengikuti
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] - 2026-08-20
### Added
- Panel admin (S6-S9): `components/admin/AdminHeader.tsx` dipasang konsisten di 5 halaman admin
  (dashboard, jadwal, layanan, dokter, riwayat) — tombol kembali ke dashboard + logout, sebelumnya
  4 dari 5 halaman tidak punya jalan balik selain tombol back browser. Kartu navigasi dashboard
  dapat ikon `lucide-react` (`CalendarClock`/`ClipboardList`/`UserRound`/`History`) mengikuti
  anatomi "Kartu Navigasi Admin" di UI Template Spec §5 yang sebelumnya belum diimplementasikan.
  Dashboard menampilkan Indikator Cahaya (elemen signature) di header, sesuai wireframe S6 di
  UI Template Spec §6 — admin melihat status buka/tutup yang sama persis dengan pasien.
  `app/admin/page.tsx` diubah jadi Server Component tipis (fetch `klinik_info` + `jadwal_praktik`,
  pola sama dengan homepage publik), logic interaktif dipindah ke `AdminDashboard.tsx`. Tetap
  sidebar-free (keputusan eksplisit UI Template Spec §6), tidak ada token warna/font baru.
  ([PR #18](https://github.com/basstian20/CahayaMedika/pull/18))
- Editor Layanan/Dokter (S7/S8): tombol upload foto dokter (native `<input type="file">` tanpa
  styling) diganti tombol bertoken (rounded-xl, min-h-44px — UI Template Spec §5/§7). Kartu tiap
  item di editor Layanan/Dokter dapat label penomoran ("Layanan 1", "Dokter 1") untuk scannability,
  konsisten dengan pola grouping per-dokter yang sudah ada di `JadwalForm`. Checkbox "Tampilkan di
  homepage" dapat `accent-cahaya`, menggantikan warna default biru browser.
  ([PR #20](https://github.com/basstian20/CahayaMedika/pull/20))
### Fixed
- Preview & upload foto dokter (S8) selalu salah target: `useFieldArray({ name: "dokter" })`
  secara default React Hook Form meng-overwrite properti `id` tiap item dengan id tracking
  internal-nya sendiri (di-generate ulang tiap render, tidak stabil server/client), sehingga
  `fotoUrlById[field.id]` dan target `dokterId` upload selalu salah — foto dokter yang sudah
  tersimpan tidak pernah muncul di preview. Diperbaiki dengan `keyName: "_fieldId"` supaya id
  tracking RHF disimpan terpisah dari `id` asli (dokter_id sungguhan).
  ([PR #20](https://github.com/basstian20/CahayaMedika/pull/20))

## [0.2.0] - 2026-08-20
### Security
- Upgrade `next` 14.2.15 → 15.5.23 ([PR #13](https://github.com/basstian20/CahayaMedika/pull/13)), menutup 6 advisory `npm audit`
  high-severity yang relevan untuk app ini dan fix-nya tidak pernah di-backport ke jalur 14.2.x:
  DoS/cache-poisoning React Server Components (GHSA-q4gf-8mx6-v5v3, GHSA-8h8q-6873-q5fj,
  GHSA-wfc6-r584-vfw7, GHSA-vfv6-92ff-j949), DoS Image Optimization API (GHSA-h64f-5h5j-jqjh —
  relevan karena `next/image` dipakai luas termasuk foto dokter), dan RSC request deserialization
  DoS (GHSA-h25m-26qc-wcjf). Next.js 16.x (rename `middleware.ts`→`proxy.ts`, Turbopack default,
  ESLint 9 wajib, Node 20.9+) sengaja ditunda ke inisiatif terpisah — bukan syarat menutup
  advisory di atas.
### Changed
- `@supabase/ssr` 0.5.1 → 0.12.4 dan `@supabase/supabase-js` 2.45.4 → 2.112.3 (peer dependency
  `@supabase/ssr` terbaru), mengikuti bump Next.js 15 di atas. `cookies()`/`headers()` jadi async
  di Next 15 dan pola cookie `get/set/remove` di `@supabase/ssr` sudah deprecated diganti
  `getAll/setAll` — `createServerSupabaseClient()` (`lib/supabase/server.ts`) dan `middleware.ts`
  disesuaikan, 11 call site ditambah `await`. React tetap 18.3.1, Tailwind tetap 3.4.x (locked,
  CLAUDE.md §2.2) — tidak ikut naik karena tidak diwajibkan peer dependency Next 15.5.23.
### Added
- Logo klinik asli dipasang di header publik, favicon (`app/icon.png`), login admin, dan
  header dashboard admin — menggantikan placeholder dot warna. Logo diproses background
  transparan + auto-crop whitespace. Header dashboard admin (latar gelap `bg-nakhoda`)
  memakai chip `bg-latar` di belakang logo karena mark navy-nya nyaris tak kontras (~1.8:1)
  langsung di atas latar gelap.
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
- Login admin (S5): tombol toggle show/hide password diganti dari teks "Tampilkan"/
  "Sembunyikan" jadi ikon mata (`Eye`/`EyeOff`, `lucide-react` — sudah dipakai di
  `LayananCard.tsx`), `aria-label` dan target sentuh 44×44px tetap dipertahankan
  (UI Template Spec §5, §7). ([PR #14](https://github.com/basstian20/CahayaMedika/pull/14))
### Fixed
- Audit keamanan & performa (2026-08-19): storage path upload foto dokter tidak lagi diturunkan
  dari `file.name` client-controlled (risiko path/prefix injection ke bucket `dokter-foto`),
  sekarang dipetakan dari MIME tervalidasi (`FOTO_MIME_TO_EXT`). JSON-LD di homepage publik
  meng-escape `<` sebelum diinjeksikan lewat `dangerouslySetInnerHTML` (cegah stored XSS lewat
  field `klinik_info` yang berisi `</script>`). Foto dokter (homepage publik + preview upload
  admin) dipindah dari `<img>` mentah ke `next/image`, memakai `remotePatterns` yang sudah
  terdaftar di `next.config.mjs` — resize otomatis, WebP/AVIF, srcset responsif, lazy-loading.
- Kartu layanan (S1/S2) merender kotak kosong sebagai pengganti ikon (anatomi Kartu Layanan
  di UI Template Spec §5 minta line-icon konsisten). Ditambahkan `components/public/LayananCard.tsx`
  dengan pemetaan kata kunci nama layanan ke ikon `lucide-react` (vaksin/gizi/anak/gigi,
  fallback stethoscope). Grid diganti dari CSS grid ke flex+justify-center supaya baris
  terakhir yang tidak penuh center, bukan rata kiri berlubang; hover state ditambah lift
  halus sesuai spec.
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
