# Klinik Cahaya Medika

Landing page satu halaman + panel admin ringan untuk klinik keluarga fiktif "Klinik Cahaya
Medika". Studi kasus ilustratif/template internal NobleDev — dipakai sebagai template
dokumentasi yang bisa direplikasi untuk klien SME sejenis (klinik, bimbel, biro jasa), bukan
proyek klien nyata.

**Status:** Draft — Template Internal

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
lihat `supabase/STORAGE.md`.

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

## Dokumentasi

Seluruh dokumen sumber (PRD, SOW, Technical Spec, Backend Blueprint, dst.) ada di
[`docs/`](./docs/) — ini sumber kebenaran tunggal untuk keputusan produk/arsitektur.
`CLAUDE.md` di root adalah bridge file yang mengarahkan ke dokumen yang tepat.
