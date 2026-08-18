# Klinik Cahaya Medika

Landing page satu halaman + panel admin ringan untuk klinik keluarga fiktif "Klinik Cahaya
Medika". **Studi kasus ilustratif/template internal NobleDev** — dibangun sebagai contoh
end-to-end untuk proyek web SME (klinik, bimbel, biro jasa): dari dokumen scoping (PRD/SOW)
sampai kode produksi, bukan proyek klien nyata.

**Status:** Draft — Template Internal · lihat [Status Proyek](#status-proyek--yang-masih-terbuka) di bawah untuk apa yang sudah dan belum selesai.

## Coba Sendiri (Demo)

Panel admin bisa dicoba langsung tanpa setup lokal — akun demo publik, data fiktif, aman
dieksplorasi:

- **Live demo:** https://cahaya-medika-basstian20s-projects.vercel.app
- **Login admin:** tambahkan `/admin/login` di URL di atas
- **Email:** `admin-demo@cahayamedika.id`
- **Password:** `DemoCahaya2026!`

Akun ini pakai role yang sama seperti admin asli — proyek ini sengaja cuma punya 1 role,
tanpa RBAC bertingkat (CLAUDE.md §2) — jadi siapa pun yang login bisa ubah jadwal, layanan,
dan profil dokter sungguhan di database demo. Datanya fiktif dan aman diutak-atik; setiap
perubahan tetap tercatat di `/admin/riwayat` beserta email akunnya. Data awal (klinik, 3
dokter, 5 layanan, jadwal mingguan) diisi lewat `scripts/seed-demo.mjs` +
`scripts/enrich-demo.mjs` — jalankan ulang kapan saja untuk reset ke kondisi wajar kalau ada
yang iseng mengubahnya.

## Kenapa proyek ini ada

Sebagian besar contoh portofolio berhenti di "kode yang jalan". Proyek ini sengaja dipakai
untuk mendemonstrasikan hal lain: **bagaimana satu developer solo membawa proyek SME dari
dokumen kebutuhan mentah ke kode yang bisa diaudit orang lain tanpa perlu bertanya**, dengan
rantai keputusan yang tertelusuri secara end-to-end:

1. **10 dokumen sumber berurutan** (`docs/`) — PRD → SOW → wireframe → tech spec → blueprint
   backend → spec endpoint → design token → frontend logic — setiap revisi di satu dokumen
   di-backport eksplisit ke dokumen lain yang bergantung padanya, bukan dibiarkan drift diam-diam.
2. **Kode yang mengikuti dokumennya secara harfiah** — struktur folder, kontrak API, dan token
   desain di kode ini bisa ditelusuri balik ke section spesifik di `docs/` (lihat pesan commit
   di `git log`, tiap fitur menyebut dokumen rujukannya).
3. **Keputusan arsitektur dengan alasan tertulis, bukan cuma pilihan** — mis. kenapa write
   jadwal+riwayat lewat satu Postgres RPC (atomicity), kenapa RLS jadi lapisan otorisasi utama
   bukan cuma pemeriksaan aplikasi, kenapa guard di frontend cuma UX bukan keamanan.

## Sorotan Teknis

- **Next.js 14 App Router** dengan SSG + on-demand ISR untuk halaman publik (bukan
  time-based revalidation) — di-trigger manual lewat `revalidatePath()` setelah tiap write
  admin sukses.
- **Supabase RLS sebagai lapisan otorisasi utama** — repository write modul bisnis pakai
  session-scoped client (`authenticated`), bukan `service_role`, supaya RLS tidak ter-bypass.
- **Atomic write lintas tabel via Postgres function** (`fn_update_jadwal_dan_riwayat`, dipanggil
  lewat `.rpc()`) — menghindari window inkonsistensi yang muncul kalau `jadwal_praktik` dan
  `riwayat_perubahan` ditulis lewat dua `.insert()` client terpisah.
- **Design system dengan token terdokumentasi** (`docs/Klinik_Cahaya_Medika_UI_Template_Spec.md`)
  — bukan warna/spacing ad-hoc, termasuk elemen signature "Indikator Cahaya" (badge status
  buka/tutup custom, bukan traffic-light generik).
- **Module-based architecture** (`lib/modules/<nama-modul>/{*.schema,*.service,*.repository,*.types}.ts`)
  konsisten di 5 modul bisnis (jadwal, layanan, dokter, riwayat, klinik-info).

## Status Proyek — Yang Masih Terbuka

Ditulis apa adanya, karena itu bagian dari cara kerja proyek ini (lihat CLAUDE.md §7):

- **Live demo sudah di production** (lihat [Coba Sendiri](#coba-sendiri-demo) di atas) —
  `main` sudah di-deploy otomatis lewat integrasi Git Vercel setelah merge PR terakhir.
- **Test suite formal (unit/integration) belum ditulis** — ini keputusan sadar dengan trigger
  eksplisit ("mulai begitu scope proyek bertambah di luar MVP"), bukan terlewat. Lihat
  `docs/Klinik_Cahaya_Medika_Frontend_Logic.md` bagian "Item yang Tetap Terbuka" untuk skeleton
  test case yang sudah disiapkan.
- **QA visual/aksesibilitas via Playwright** sedang disiapkan (`tests/`, lihat CLAUDE.md §9) —
  cakupannya sengaja lebih sempit dari test suite formal di atas.

## Tech Stack

- Next.js 14+ (App Router), TypeScript
- Supabase (Postgres + Auth + Storage + Row Level Security)
- Tailwind CSS
- Zod, React Hook Form
- Hosting: Vercel (region `sin1`)

Detail lengkap: [`CLAUDE.md`](./CLAUDE.md) §2.

## Setup Lokal

```bash
git clone <repo-url>
cd klinik-cahaya-medika
npm install
cp .env.example .env.local   # isi kredensial Supabase dev di .env.local
npm run dev
```

Migrasi database ada di `supabase/migrations/` (0001–0006) — jalankan lewat Supabase CLI atau
Dashboard SQL Editor sebelum `npm run dev`. Bucket Storage `dokter-foto` perlu diprovision manual,
lihat `supabase/STORAGE.md`. Untuk mengisi data contoh + akun admin demo, jalankan
`npm run seed:demo` (sekali) lalu `npm run enrich:demo` (opsional, memperkaya data) — keduanya
butuh `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.

**Catatan `next build`:** homepage publik (`app/(public)/page.tsx`) di-generate sebagai SSG dan
query langsung ke Supabase saat build — `next build` butuh `NEXT_PUBLIC_SUPABASE_URL` &
`NEXT_PUBLIC_SUPABASE_ANON_KEY` valid mengarah ke project dengan migrasi 0001–0006 sudah
dijalankan, kalau tidak prerendering `/` akan gagal. Ini perilaku yang diharapkan, bukan bug —
Vercel Preview/Production sudah punya env var ini ter-scope per environment (CLAUDE.md §6).

## Struktur Folder

- `app/(public)/` — homepage publik (S1–S4)
- `app/admin/` — panel admin (S5–S9)
- `app/api/admin/` — Route Handler admin
- `lib/modules/` — service/repository/schema per modul bisnis
- `supabase/migrations/` — migrasi SQL berurutan

Detail lengkap: [`docs/Klinik_Cahaya_Medika_Backend_Blueprint.md`](./docs/Klinik_Cahaya_Medika_Backend_Blueprint.md) §3.

## QA & Testing

```bash
npx playwright install   # sekali saja, download browser binaries
npm run test:a11y        # jalankan test aksesibilitas/visual (butuh npm run dev di terminal lain)
npm run typecheck        # type check tanpa perlu next build penuh (tidak butuh kredensial Supabase)
```

Playwright dipakai untuk QA visual & aksesibilitas (kontras warna, target sentuh 44×44px,
breakpoint) sesuai kebijakan CLAUDE.md §9 — **bukan** pengganti test suite bisnis-logic formal
yang statusnya masih sengaja terbuka (lihat [Status Proyek](#status-proyek--yang-masih-terbuka)).

## Dokumentasi

Seluruh dokumen sumber (PRD, SOW, Technical Spec, Backend Blueprint, dst.) ada di
[`docs/`](./docs/) — ini sumber kebenaran tunggal untuk keputusan produk/arsitektur.
`CLAUDE.md` di root adalah bridge file yang mengarahkan ke dokumen yang tepat.
