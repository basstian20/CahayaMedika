# CLAUDE.md — Klinik Cahaya Medika

> Bridge file untuk Claude Code. Ini **bukan** pengganti dokumen sumber — tugasnya cuma mengarahkan ke dokumen yang tepat dan mencegah keputusan yang sudah dikunci ditulis ulang secara diam-diam. Kalau ada pertanyaan yang jawabannya ada di salah satu dokumen di bawah, **baca dokumennya**, jangan menebak atau mengasumsikan ulang dari nol.

## 0. Proyek ini apa

Landing page satu halaman (multi-section) untuk klinik keluarga fiktif "Klinik Cahaya Medika", plus panel admin ringan agar pemilik klinik bisa update jadwal dokter & info layanan sendiri. **Ini studi kasus ilustratif/template internal NobleDev** — dipakai sebagai template dokumentasi yang bisa direplikasi untuk klien SME sejenis (klinik, bimbel, biro jasa), bukan proyek klien nyata. Jangan kaget kalau ada placeholder harga/tanggal — itu sengaja, dicatat eksplisit di tiap dokumen.

Tier dokumen: **Standard**. Tim: **1 developer solo**, tidak ada split tim/service — banyak keputusan arsitektur di bawah ini (CI/CD, environment strategy, tanpa staging permanen, dsb.) sengaja disederhanakan untuk konteks ini, bukan best practice generik yang harus ditiru di semua proyek.

## 1. Urutan baca dokumen (WAJIB sebelum mulai coding)

Delapan dokumen ini adalah **satu rantai keputusan berurutan** — masing-masing dibangun di atas yang sebelumnya, dan kalau ada revisi, itu selalu di-backport secara eksplisit (dicatat sebagai "Catatan revisi"/"Catatan sinkronisasi" di dokumen terkait). Baca dalam urutan ini, jangan loncat:

| # | Dokumen | Menjawab apa | Kapan perlu dibuka |
|---|---|---|---|
| 1 | `prd-klinik-cahaya-medika.md` (**v1.1**) | Fitur, modul, role, batasan scope | Sebelum menyentuh fitur apa pun — ini sumber kebenaran untuk *apa* yang dibangun |
| 2 | `sow-klinik-cahaya-medika.md` | Deliverable, harga, jadwal komitmen ke klien, exclusions | Kalau ragu apakah sesuatu termasuk scope atau tidak |
| 3 | `userflow-wireframe-klinik-cahaya-medika.md` | 9 screen (S1–S9), 3 flow, traceability ke PRD/SOW | Sebelum membangun UI/halaman apa pun |
| 4 | `Klinik_Cahaya_Medika_Technical_Spec.md` | Arsitektur, API contract otoritatif, data model, NFR, security | **Dokumen arsitektur utama** — baca §2–§7 sebelum keputusan teknis apa pun |
| 5 | `Klinik_Cahaya_Medika_Timeline_Milestones.md` | Jadwal fase, RACI, buffer | Untuk konteks urutan kerja, bukan untuk keputusan teknis |
| 6 | `Klinik_Cahaya_Medika_Deployment_Maintenance_Plan.md` | CI/CD, environment strategy, rollback, incident runbook, maintenance | Sebelum setup deployment/CI, sebelum incident apa pun |
| 7 | `Klinik_Cahaya_Medika_Backend_Blueprint.md` (**v1.1**) | **Peta file/folder konkret** — file mana isinya apa | **Buka ini duluan** setiap kali mau scaffold file baru |
| 8 | `Klinik_Cahaya_Medika_Endpoints_Spec.md` (**v1.1**) | Kode referensi per endpoint backend (route, schema, service, repository, test) | Saat implementasi endpoint spesifik — salin pola dari sini, jangan reinvent |
| 9 | `Klinik_Cahaya_Medika_UI_Template_Spec.md` | Design token (warna, tipografi, spacing, radius, motion), component blueprint, page layout blueprint | Sebelum menulis komponen visual apa pun — token dan komponen di sini **otoritatif**, jangan improvisasi warna/font baru |
| 10 | `Klinik_Cahaya_Medika_Frontend_Logic.md` | Kode referensi frontend (API client, hooks, form wiring, route guard) per screen S5–S9 (+ bonus S3 publik) | Saat implementasi UI/logic screen spesifik — rekan langsung dari Endpoints Spec, kontrak API sama persis |
| — | `TSD_Revisi_API_Contracts.md` | Revisi 3 dari 7 kontrak API di Tech Spec §4.3 | Baca bersamaan dengan Tech Spec §4.3 — dokumen ini **menimpa** bagian itu |

**Urutan kerja saat scaffolding:** Backend Blueprint §2 (module map) → §3 (struktur folder) → §4 (detail per modul) → §5 (endpoint-to-file mapping) → §6 (migration order) → Endpoints Spec untuk kode referensi backend per endpoint → UI Template Spec §3–§5 (token + component blueprint) sebelum menulis komponen visual apa pun → Frontend Logic untuk kode referensi frontend per screen. Untuk logika bisnis (kapan status buka/tutup dihitung, kenapa on-demand ISR dipilih, dsb.) selalu rujuk balik ke Tech Spec §3–§5 — Blueprint, Endpoints Spec, UI Template Spec, dan Frontend Logic sengaja tidak mengulang penjelasan itu, hanya memetakan ke lokasi file/kode/desain.

## 2. Tech stack (non-negotiable — sudah dikunci di Tech Spec, jangan diganti tanpa alasan kuat)

| Layer | Pilihan | Kenapa (ringkas — detail di Tech Spec §2) |
|---|---|---|
| Framework | **Next.js 14+, App Router** | SSG + on-demand ISR untuk halaman publik, Route Handlers sebagai API tipis |
| Bahasa | **TypeScript** | — |
| Backend-as-a-service | **Supabase** — Postgres + Auth + Storage + Row Level Security | RLS jadi **lapisan otorisasi utama**, bukan cuma pemeriksaan di level aplikasi |
| Hosting | **Vercel**, function region **`sin1`** (Singapore) | Wajib di-set eksplisit lewat `vercel.json` — default Vercel adalah `iad1` (US East). Butuh **Vercel Pro plan**. |
| Database region | **Supabase Singapore (`sin1`)** | Latensi untuk pengguna Indonesia |
| Validasi | **Zod** | Konvensi de-facto Next.js App Router, tipe TypeScript tersimpul otomatis dari schema |
| Revalidation | **On-demand ISR** via `revalidatePath()` | Dipicu manual setelah tiap write admin sukses — bukan time-based ISR |
| Auth | **Supabase Auth**, 1 role (`admin`) | Tidak ada RBAC bertingkat — `requireAdmin()` satu-satunya guard |
| Storage | Supabase Storage, bucket **`dokter-foto`** | Untuk foto profil dokter, limit 2MB |
| Locale | Bahasa Indonesia UI, WhatsApp sebagai CTA utama, timezone **Asia/Jakarta** | Konteks pasar Indonesia — jangan pakai Midtrans/Xendit atau payment gateway apa pun, itu **exclusion eksplisit** di SOW §3 |
| Test suite | **Belum ada** — `next build` (type check) satu-satunya hard gate otomatis saat ini | Keputusan default dengan trigger eksplisit: mulai tulis test begitu scope proyek bertambah. Lihat Backend Blueprint §10.2 sebelum menambah test framework atas inisiatif sendiri |

**Yang secara eksplisit TIDAK ada di scope ini** (jangan diimplementasikan kecuali PRD/SOW direvisi): payment gateway, booking/appointment system, staging environment permanen terpisah, background jobs/queue, RBAC bertingkat, versioning API (`/v1/`), multi-bahasa Inggris.

### 2.1 Stack frontend tambahan (Frontend Logic §0 — dikunci final)

| Layer | Pilihan | Kenapa (ringkas) |
|---|---|---|
| Validasi frontend | **Reuse langsung** `*.schema.ts` dari `lib/modules/*` | **Jangan** tulis ulang Zod schema versi client terpisah — itu menciptakan dua sumber kebenaran yang bisa drift. Schema backend sudah isomorphic (tidak ada import server-only). |
| Form wiring | **React Hook Form + `@hookform/resolvers/zod`** | Standar de-facto dengan Zod di Next.js App Router; tabel jadwal S7 (7 baris × banyak field) butuh `useFieldArray`. |
| Server state / data fetching | **Native `fetch` + custom hook** (`idle/loading/success/error`), **bukan** TanStack Query/SWR | Tidak ada kebutuhan cache lintas komponen untuk MVP ini — jangan tambah dependency tanpa pemicu nyata. **Trigger revisi:** begitu screen admin butuh sinkronisasi data lintas komponen real-time, atau jumlah admin/role bertambah dari 1. Kalau trigger itu terjadi, migrasi masuk lewat change request (SOW §7) — jangan ditambahkan informal ke kode yang sudah berjalan. |
| Auth client | **Supabase Auth SDK**, `signInWithPassword()` langsung dari browser client | Tidak ada custom `/api/auth/login`. |

**Prinsip penting — guard frontend adalah UX, bukan keamanan (Frontend Logic §0.4):** `middleware.ts`, `useAdminSession`, dan guard komponen apa pun di frontend **selalu bisa di-bypass** user yang mengedit local state atau memanggil API langsung. Guard ini ada supaya admin yang sah dapat pengalaman cepat & jelas — bukan garis pertahanan keamanan. Penegakan sesungguhnya **selalu** di server: `requireAdmin()` di tiap Route Handler + Row Level Security Supabase. Jangan pernah menambah kompleksitas guard frontend dengan alasan "menutup celah keamanan" — celah itu tidak ada di sana.

### 2.2 Design system (UI Template Spec — otoritatif untuk seluruh keputusan visual)

**Jangan improvisasi warna/font/spacing baru.** Token di bawah ini final, sudah melalui proses riset + self-critique (UI Template Spec §2, §8), dan disinkronkan sebagian dengan referensi desain eksternal `docs/design.html` per revisi 2026-08-18 (lihat UI Template Spec, catatan revisi di bagian atas dokumen + §8) — kalau terasa ada token yang hilang untuk kebutuhan baru, cek dulu apakah itu genuinely kebutuhan baru atau bisa dipetakan ke token yang sudah ada.

| Token warna | Hex (implementasi Tailwind) | Peran |
|---|---|---|
| `color-nakhoda` | `#151D18` (≈ `oklch(0.22 0.015 155)`) | Teks judul, header, warna dasar panel admin |
| `color-cahaya` | `#497F5D` (≈ `oklch(0.55 0.08 155)`) | Aksen utama, hover, elemen signature |
| `color-cta-whatsapp` | `#1E9E5A` | **Khusus** tombol CTA WhatsApp — jangan dipakai di luar itu, jangan diganti `color-cahaya` |
| `color-latar` | `#F5FAF6` (≈ `oklch(0.98 0.007 155)`) | Latar belakang halaman |
| `color-jaga` | `#67BB6B` (≈ `oklch(0.72 0.14 145)`) | Status "Buka sekarang" — beda sengaja dari `color-cta-whatsapp` walau sama-sama hijau |
| `color-senja` | `#9C7A5B` | Status "Tutup" — cokelat-tanah, bukan merah alarm |
| — | `#C0392B` | Error validasi form — **di luar 6 token utama**, sengaja berbeda dari `color-senja` supaya "tutup" dan "kesalahan input" tidak tertukar makna |

Nilai disimpan sebagai hex di Tailwind config (bukan string `oklch()` mentah) karena Tailwind 3.4.13 di proyek ini tidak resolve modifier opacity (`/10`, `/70`, dst.) dengan benar di atas custom color token berformat oklch — lihat UI Template Spec §3 untuk detail.

Tipografi: **Figtree** (display/headline dan body — satu keluarga font, per sinkronisasi `design.html`), **IBM Plex Mono** (data presisi — jam praktik, timestamp, angka tabular, dipertahankan karena `design.html` tidak mencakup tabel data). Radius `16px` konsisten (kartu/tombol/input) — sengaja **bukan** bentuk blob/organik penuh. Kontras minimum **WCAG AA 4.5:1** (perhatian khusus: teks di atas `color-cahaya` wajib `color-nakhoda` gelap, putih tidak lolos AA). Target sentuh minimum **44×44px**. Breakpoint **360px / 768px / 1280px**, mobile-first.

**Elemen signature — "Indikator Cahaya":** badge status buka/tutup dirender sebagai titik cahaya dengan halo lembut (bernapas saat "buka"), **bukan** badge traffic-light generik. Ini elemen paling spesifik-brand di seluruh sistem — jangan disederhanakan jadi dot hijau/merah biasa, dan jangan direplikasi mentah-mentah kalau suatu saat dipakai ulang untuk brief klien lain (motif harus diturunkan ulang dari nama/identitas klien tersebut — lihat UI Template Spec §4).

Component blueprint lengkap (tombol, form, tabel jadwal, kartu navigasi admin, toast, baris log) ada di UI Template Spec §5 — setiap komponen punya Do/Don't eksplisit, baca sebelum membuat variannya sendiri.

### 2.3 Skill desain eksternal — kebijakan pemakaian

Proyek ini boleh memakai skill desain pihak ketiga (mis. **Impeccable**, **Taste Skill**, **UI UX Pro Max**) untuk menaikkan kualitas eksekusi — tapi **posisinya adalah auditor/reviewer, bukan pengambil keputusan desain baru.** `UI_Template_Spec.md` sudah menjalankan proses riset + self-critique (§2, §8 dokumen tersebut) dan tokennya **final** — skill eksternal tidak boleh mengganti warna, font, radius, atau elemen signature ("Indikator Cahaya") yang sudah diputuskan di sana, meski skill itu punya rekomendasi default sendiri yang berbeda.

**Aturan pemakaian:**

1. **Pilih satu, jangan pasang Impeccable dan Taste Skill sekaligus.** Keduanya sama-sama sistem "taste" untuk generasi/kritik desain — menjalankan dua sistem taste bersamaan pada token yang sudah final cuma menambah instruksi yang saling tumpang tindih tanpa keputusan baru yang genuinely perlu diambil.
2. **Jalankan setelah implementasi, bukan sebelum** — mis. `/audit` atau `/critique` dipakai untuk memeriksa apakah kode yang sudah ditulis konsisten dengan token/component blueprint yang ada, bukan untuk menghasilkan token/komponen baru dari nol.
3. **Setiap kali memanggil skill ini, sertakan instruksi eksplisit:** *"Evaluasi terhadap `docs/Klinik_Cahaya_Medika_UI_Template_Spec.md` — jangan usulkan token warna/font/radius baru di luar yang sudah ada di sana."* Kalau skill mengusulkan perubahan token, itu jadi rekomendasi yang perlu **persetujuan eksplisit user**, bukan diterapkan otomatis (sama seperti aturan "keputusan berdampak nyata harus ditanyakan dulu" di §7).
4. **UI UX Pro Max** (database referensi 67 style/161 palet/57 font pairing) paling relevan dipakai **bukan untuk proyek Klinik Cahaya Medika ini** (desainnya sudah final), tapi kalau template ini direplikasi untuk brief klien lain di masa depan — pada tahap itu, dipakai sebagai titik awal riset sebelum proses manual seperti yang menghasilkan `UI_Template_Spec.md` saat ini, bukan pengganti proses riset itu.
5. **Kalau hasil audit/critique dari skill manapun diterapkan ke kode**, catat di commit message (§8.3) tool mana yang dipakai dan section token/komponen mana yang diperiksa — supaya tetap traceable, konsisten dengan prinsip dokumentasi proyek ini.

## 3. Struktur folder & module map

Peta lengkap ada di Backend Blueprint §2 (module map: Auth & Session, Klinik Info, Layanan, Dokter, Jadwal, Riwayat Perubahan, Revalidation) dan §3 (struktur folder lengkap: `app/(public)/`, `app/admin/`, `app/api/admin/`, `lib/modules/`, `lib/supabase/`, `lib/auth/`, `lib/revalidation/`, `lib/shared/`, `supabase/migrations/`). **Jangan bikin struktur folder baru yang menyimpang dari peta ini** — kalau kebutuhan baru muncul dan tidak cocok di struktur yang ada, itu sinyal untuk mengecek ulang ke PRD/Tech Spec dulu, bukan langsung menambah folder.

Endpoint yang ada (5 total, semua di bawah `/api/admin/`, semua butuh `requireAdmin()`):

| Method | Path | Modul |
|---|---|---|
| `PATCH` | `/api/admin/jadwal` | Jadwal praktik dokter |
| `PATCH` | `/api/admin/layanan` | Daftar layanan klinik |
| `PATCH` | `/api/admin/dokter` | Profil dokter |
| `POST` | `/api/admin/dokter/foto` | Upload foto dokter ke Supabase Storage |
| `GET` | `/api/admin/riwayat` | Log audit (read-only) |

Response envelope standar: `{ success: boolean, ...data }` — jangan bikin shape response baru, ikuti pola di `lib/shared/response.ts` (Endpoints Spec §0).

## 4. Database — urutan migrasi (Backend Blueprint §6, sudah v1.1)

```
0001_klinik_info.sql
0002_layanan.sql
0003_dokter.sql
0004_jadwal_praktik.sql          -- + unique constraint jadwal_praktik_dokter_hari_unique
0005_riwayat_perubahan.sql       -- + FK constraint bernama riwayat_perubahan_admin_id_fkey
0006_fn_update_jadwal_dan_riwayat.sql   -- Postgres function, dipanggil via .rpc(), BUKAN dua insert terpisah
```

**Bucket Storage `dokter-foto` bukan bagian dari migrasi SQL** — provisioning lewat Supabase Dashboard/CLI config terpisah, jangan cari file migrasi ke-7.

**Kenapa migrasi 6 berupa Postgres function, bukan dua panggilan `.insert()` dari client:** Supabase JS client tidak punya transaction multi-statement lintas panggilan. Kalau `jadwal_praktik` dan `riwayat_perubahan` ditulis lewat dua `.from().insert()` terpisah, itu dua transaction Postgres berbeda — window inkonsistensi kalau salah satu gagal. RPC ke Postgres function menjaga keduanya dalam satu transaction asli. **Jangan "sederhanakan" ini jadi dua insert client-side** — itu bukan simplifikasi, itu menghilangkan atomicity yang jadi alasan migrasi ini ada. Detail penuh: Backend Blueprint §10.1 poin 5.

**RLS adalah lapisan otorisasi utama** (Tech Spec §7.1) — repository write modul bisnis (`layanan.repository.ts`, `dokter.repository.ts`, `jadwal.repository.ts`) **wajib pakai session-scoped client** (konteks `authenticated`), **bukan** `service_role`. Kalau pakai `service_role` di path request handler biasa, RLS ter-bypass dan lapisan otorisasi jadi dekoratif. `service_role` (`createAdminSupabaseClient()`) tetap ada tapi **reserved** untuk operasional non-bisnis (migrasi data, tooling internal) — bukan default. Detail: Backend Blueprint §10.1 poin 2 dan §8.

## 5. Konvensi kode (Backend Blueprint §7)

- **Error handling:** `lib/shared/errors.ts` — kelas `UnauthorizedError`(401)/`ValidationError`(400)/`NotFoundError`(404)/`InternalError`(500). Route Handler bungkus service call di try-catch, map lewat helper bersama — jangan tulis if/else status code manual di tiap Route Handler.
- **Validasi:** tiap modul admin punya `*.schema.ts` sendiri (Zod), dipanggil `schema.parse(body)` di awal Route Handler sebelum masuk service.
- **Auth guard:** `requireAdmin()` (`lib/auth/guards.ts`) — satu-satunya guard, tidak perlu sistem permission granular (cuma 1 role).
- **Revalidation:** setelah write admin sukses, panggil `revalidatePublicHomepage()` (`lib/revalidation/revalidate-public.ts`) yang membungkus `revalidatePath('/')` dalam try-catch + logging. **Kegagalan revalidation TIDAK boleh menggagalkan response sukses ke admin** — write DB tetap dianggap berhasil, kegagalan revalidation cuma tercatat di log untuk retry manual.
- **Logging:** `lib/shared/logger.ts`, wrapper tipis di atas `console.log/error` terstruktur (JSON) — cukup untuk dibaca lewat Vercel function logs, jangan tambah library logging eksternal (anti-over-engineering, konsisten dengan skala proyek ini).
- **SEO/structured data:** tidak ada modul backend sendiri — schema.org markup (`LocalBusiness`/`MedicalClinic`) dirender langsung di `app/(public)/page.tsx`, ambil data dari `klinik-info.repository.ts`.

## 6. Env vars (nama saja — nilai nyata TIDAK PERNAH ditulis di kode atau di sini)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server-side ONLY, tidak pernah masuk client bundle, reserved-use only
```

Vercel project setting: nilai di-scope **per environment** (Production → project Supabase production; Preview/Development → project Supabase development bersama). Local/Dev dan Preview sengaja berbagi **1 Supabase project non-production yang sama**, bukan dua project terpisah — keputusan ini ada di Deployment Plan §2, jangan bikin project ketiga tanpa alasan baru.

`vercel.json` **wajib** set region ke `sin1` secara eksplisit — default Vercel adalah `iad1`.

## 7. Sebelum menambah apa pun yang tidak ada di dokumen

Kalau kebutuhan implementasi tidak tercakup jelas di salah satu dari 10 dokumen di atas:

1. Cek apakah itu benar-benar di luar scope (lihat SOW §3 Exclusions) — kalau iya, **jangan diimplementasikan**, tanyakan ke user dulu.
2. Cek apakah itu keputusan yang sudah pernah dibahas tapi ditandai `[ASUMSI]`/`[TETAP TERBUKA]` di salah satu dokumen (terutama Backend Blueprint §10, Endpoints Spec bagian akhir, Deployment Plan §12) — kalau iya, itu **keputusan yang sengaja belum dikunci**, bukan celah yang boleh diisi diam-diam.
3. Kalau genuinely belum dibahas sama sekali di dokumen manapun — buat keputusan kecil (penamaan file, dsb.) mengikuti konvensi yang sudah ada, tapi untuk keputusan yang punya trade-off nyata, **tanyakan dulu**, jangan asumsikan.

## 8. Version Control & Kerapian Repo

**Prinsip dasar:** proyek ini dikerjakan 1 developer solo, tapi repo-nya harus terbaca seolah dikerjakan tim profesional — riwayat commit, struktur branch, dan dokumentasi harus bisa diaudit developer lain (atau agency lain yang mengambil alih maintenance) tanpa perlu bertanya "ini kenapa begini" ke siapa pun. Kerapian di sini bukan estetika, ini bagian dari kualitas deliverable NobleDev (konsisten dengan prinsip non-fabrikasi & traceability yang sudah dipakai di seluruh dokumen chain).

### 8.1 Struktur repo

```
klinik-cahaya-medika/
├── .github/
│   └── pull_request_template.md   # checklist wajib tiap PR (§8.4)
├── app/ lib/ supabase/ middleware.ts   # lihat §3 (struktur Backend Blueprint)
├── docs/
│   ├── prd-klinik-cahaya-medika.md
│   ├── sow-klinik-cahaya-medika.md
│   ├── userflow-wireframe-klinik-cahaya-medika.md
│   ├── Klinik_Cahaya_Medika_Technical_Spec.md
│   ├── TSD_Revisi_API_Contracts.md
│   ├── Klinik_Cahaya_Medika_Timeline_Milestones.md
│   ├── Klinik_Cahaya_Medika_Deployment_Maintenance_Plan.md
│   ├── Klinik_Cahaya_Medika_Backend_Blueprint.md
│   ├── Klinik_Cahaya_Medika_Endpoints_Spec.md
│   ├── Klinik_Cahaya_Medika_UI_Template_Spec.md
│   └── Klinik_Cahaya_Medika_Frontend_Logic.md
├── CLAUDE.md                       # file ini
├── README.md                       # wajib, lihat §8.5
├── CHANGELOG.md                    # wajib, format Keep a Changelog (§8.6)
├── .env.example                    # nama var saja, TIDAK PERNAH nilai asli (lihat §6)
├── .gitignore
└── package.json
```

Semua 10 dokumen sumber **hidup di `docs/`, bukan di root** — root repo harus terlihat seperti codebase, bukan tumpukan dokumen. Jangan commit file kerja sementara (draft, catatan pribadi, screenshot debugging) ke repo — kalau perlu, taruh di `.local/` yang di-ignore, atau jangan di-commit sama sekali.

### 8.2 Strategi branching

**Trunk-based sederhana** — cocok untuk 1 developer, sesuai prinsip anti-over-engineering yang sudah dipakai di seluruh dokumen chain (Tech Spec §2, Deployment Plan §2/§3). **Jangan** pakai Git Flow penuh (develop/release/hotfix branch terpisah) — itu overhead tanpa manfaat nyata untuk tim 1 orang, dan justru mengaburkan riwayat.

- `main` — selalu deployable, selalu mencerminkan apa yang ada di production. Tidak pernah di-push langsung.
- `feature/<nama-singkat>` — satu branch per unit kerja yang bisa direview sebagai satu kesatuan logis. Contoh: `feature/jadwal-admin-crud`, `feature/whatsapp-cta`, `fix/status-badge-timezone`.
- Penamaan branch: `feature/`, `fix/`, `chore/`, `docs/` sebagai prefix — konsisten dengan tipe di Conventional Commits (§8.3), supaya nama branch dan commit message bisa saling ditelusuri.
- Branch dihapus setelah merge — riwayat tetap terjaga lewat commit di `main`, bukan lewat menumpuk branch mati.

### 8.3 Commit message — Conventional Commits, wajib

Format: `<type>(<scope>): <deskripsi singkat, imperative mood>`

| Type | Kapan dipakai |
|---|---|
| `feat` | Fitur/kemampuan baru yang terlihat pengguna |
| `fix` | Perbaikan bug |
| `docs` | Perubahan dokumen di `docs/` atau `README.md`/`CLAUDE.md` saja, tanpa kode |
| `chore` | Setup tooling, dependency bump, config — tidak mengubah behavior |
| `refactor` | Perubahan struktur kode tanpa mengubah behavior yang terlihat |
| `test` | Menambah/mengubah test |
| `style` | Formatting murni (Prettier, dsb.), tidak ada perubahan logic |

Scope memakai nama modul dari Backend Blueprint §2 (`jadwal`, `layanan`, `dokter`, `riwayat`, `auth`, `revalidation`) atau area frontend (`ui`, `admin-panel`) — supaya `git log --grep` bisa filter per modul.

Contoh:
```
feat(jadwal): implementasikan PATCH /api/admin/jadwal dengan RPC atomic
fix(status-badge): perbaiki off-by-one saat jam_mulai 00:00 (edge case Frontend Logic §7)
docs(prd): revisi estimasi timeline ke v1.1 mengikuti tabel SOW §4
chore(deps): tambah react-hook-form + @hookform/resolvers
```

**Aturan traceability — setiap commit yang mengimplementasikan fitur harus bisa ditelusuri balik ke dokumen sumber.** Kalau commit itu mengimplementasikan sesuatu dari PRD/Tech Spec/Endpoints Spec/Frontend Logic, sebut modul/screen/section-nya di body commit (bukan cuma judul), misalnya:

```
feat(jadwal): implementasikan PATCH /api/admin/jadwal

Mengikuti kontrak Endpoints Spec §1 dan Backend Blueprint §6 migrasi 0006
(fn_update_jadwal_dan_riwayat, RPC atomic write jadwal + riwayat).
Ref: PRD §4 Modul 3, Wireframe S7.
```

Ini bukan formalitas kosong — ini yang memungkinkan developer lain (atau Claude Code di sesi berikutnya) menelusuri "kenapa kode ini begini" balik ke keputusan terdokumentasi, tanpa perlu bertanya.

**Jangan pernah:**
- Commit dengan pesan generik (`update`, `fix bug`, `wip`, `asdf`) — kalau genuinely masih kerja-dalam-proses, gunakan `git commit --amend` atau squash sebelum merge ke `main`, jangan biarkan riwayat `main` berisi commit WIP.
- Commit langsung ke `main` tanpa lewat PR (§8.4), bahkan untuk perubahan kecil — riwayat `main` harus 100% bisa ditelusuri lewat PR yang sudah direview.
- Mencampur beberapa `type` yang tidak berhubungan dalam satu commit (mis. `feat` + `chore` sekaligus) — pisahkan, supaya `git revert` bisa presisi kalau salah satu perlu di-rollback tanpa membatalkan yang lain.

### 8.4 Pull Request — wajib, bahkan untuk solo developer

Setiap perubahan ke `main` lewat PR, **bahkan kalau reviewer-nya diri sendiri**. Ini bukan formalitas — PR adalah titik di mana Vercel Preview Deployment otomatis jalan (Deployment Plan §3), dan titik di mana riwayat kerja jadi bisa diaudit per unit logis, bukan per commit acak.

Template PR minimum (`.github/pull_request_template.md`):
```markdown
## Ringkasan
<!-- Apa yang berubah, 1-3 kalimat -->

## Referensi dokumen
<!-- PRD §..., Tech Spec §..., Endpoints Spec #..., Frontend Logic §..., dst. -->

## Checklist
- [ ] `next build` sukses (type check + lint)
- [ ] Smoke test manual dilakukan di Preview Deployment (Deployment Plan §3)
- [ ] Tidak ada secret/kredensial ter-commit
- [ ] CHANGELOG.md diupdate (kalau user-facing)
- [ ] Sesuai token/component blueprint UI Template Spec (kalau ada perubahan visual)
```

PR yang menyentuh migrasi schema DB **wajib** disebutkan eksplisit di deskripsi (nomor migrasi, mis. "menambah `0007_...`") — sejalan dengan gate migrasi di Deployment Plan §3 CI/CD Pipeline.

### 8.5 README.md — wajib ada, minimum mencakup

1. Deskripsi proyek 2-3 kalimat (boleh salin dari PRD §1, jangan tulis ulang dari nol)
2. Tech stack (ringkas — link ke `CLAUDE.md` §2 untuk detail lengkap)
3. Cara setup lokal (clone → `npm install` → copy `.env.example` ke `.env.local` → isi kredensial dev → `npm run dev`)
4. Struktur folder ringkas (link ke Backend Blueprint §3 untuk detail lengkap)
5. Link ke `docs/` sebagai sumber kebenaran dokumentasi — **README tidak boleh mengulang isi dokumen, hanya menunjuk**
6. Status proyek (mis. badge "Draft — Template Internal" konsisten dengan status yang tercatat di tiap dokumen §Field Status)

### 8.6 CHANGELOG.md — format Keep a Changelog

```markdown
## [Unreleased]

## [0.3.0] - 2026-09-15
### Added
- Panel admin: edit jadwal dokter (PRD §4 Modul 3, Wireframe S7)
### Fixed
- Status badge off-by-one di tengah malam (edge case Frontend Logic §7)

## [0.2.0] - 2026-09-05
### Added
- Homepage publik: hero, ringkasan layanan, Indikator Cahaya (PRD §4 Modul 1, 4)
```

Versi mengikuti **Semantic Versioning** (`MAJOR.MINOR.PATCH`), di-tag lewat `git tag`, idealnya diselaraskan dengan milestone Timeline §3 (mis. akhir Fase 3 = `v0.2.0`, akhir Fase 4 = `v0.3.0`, go-live/M7 = `v1.0.0`) — supaya riwayat versi punya makna bisnis yang bisa dijelaskan ke klien, bukan angka arbitrer.

### 8.7 Yang tidak boleh masuk repo

- Nilai `.env` asli (hanya `.env.example` dengan nama var kosong — lihat §6)
- `node_modules/`, `.next/`, file build lainnya
- Kredensial Supabase, service role key, API key apa pun dalam bentuk apa pun (termasuk di komentar kode atau commit message)
- Data klien nyata kalau proyek ini nanti dipakai untuk engagement sungguhan — dummy data untuk dev/preview harus jelas ditandai (Deployment Plan §2)
- File dokumen di luar `docs/` — jangan taruh salinan PRD/dokumen lain di root atau folder acak

`.gitignore` minimum: `node_modules/`, `.next/`, `.env*.local`, `.vercel`, `*.log`, `.DS_Store`.

## 9. Testing dengan Playwright

**Ini keputusan terpisah dari item "test suite" yang tercatat `[TETAP TERBUKA]` di Backend Blueprint §10.2/Endpoints Spec item #7/Frontend Logic item #5** — jangan anggap keduanya otomatis sama. Trigger yang disepakati untuk test suite formal (unit/integration test bisnis logic) tetap "mulai begitu scope proyek bertambah". Playwright di sini dipakai untuk **QA visual & aksesibilitas**, cakupan yang lebih sempit dan berdiri sendiri — kalau nanti ingin Playwright juga dianggap menutup item test suite yang terbuka itu, itu keputusan tambahan yang perlu dicatat eksplisit sebagai revisi terdokumentasi (pola yang sama dipakai di seluruh dokumen chain — lihat §9), bukan diasumsikan otomatis.

**Setup:**
- Register **Playwright MCP** (`@playwright/mcp`) di scope project, config di-commit ke repo (`.mcp.json`) — supaya perilakunya sama persis kalau proyek ini diaudit/dilanjutkan developer lain, bukan bergantung ke environment lokal siapa pun.
- Test file di `tests/` — ikuti struktur yang **sudah disiapkan** di Backend Blueprint (`tests/modules/`, mengikuti `lib/modules/`) dan Frontend Logic (`tests/public/`, `tests/modules/*`, sudah ada skeleton test dengan `TODO: assert...` — isi implementasi nyatanya di sini, jangan tulis dari nol).

**Apa yang ditest — diturunkan langsung dari checklist yang sudah eksplisit ada di dokumen, bukan daftar baru:**

| Area | Sumber | Yang dicek |
|---|---|---|
| Kontras warna | UI Template Spec §7 | Tiap pasangan teks-latar ≥4.5:1 (WCAG AA) — kombinasikan dengan `axe-core` |
| Target sentuh | UI Template Spec §7 | Elemen interaktif ≥44×44px |
| Breakpoint | UI Template Spec §7 | Screenshot di 360px/768px/1280px, bandingkan ke Page Layout Blueprint §6 |
| `prefers-reduced-motion` | UI Template Spec §3 Motion | Glow "Indikator Cahaya" fallback ke halo statis, tidak ada informasi yang hilang |
| Edge case status buka/tutup | Frontend Logic §7 (`tests/public/klinik-status.test.ts`) | Tengah malam (`jam_mulai 00:00`), pergantian hari, timezone browser ≠ Asia/Jakarta, jadwal kosong → fallback default, jadwal+default sama-sama kosong → `unknown` bukan crash |
| Smoke test end-to-end | Deployment Plan §3 (CI/CD Pipeline) | Render homepage, login admin, submit form jadwal/layanan/dokter, CTA WhatsApp mengarah ke link benar |

**Hard gate CI (Deployment Plan §3) tetap `next build`** — kalau Playwright test ditambahkan ke pipeline, tentukan eksplisit apakah jadi hard gate baru (memblokir merge) atau tetap soft gate/informational seperti status test suite saat ini, dan catat perubahan gate itu di Deployment Plan §3 sebagai revisi, bukan diam-diam mengubah perilaku CI yang sudah didokumentasikan.

## 10. Status dokumen saat ini

Semua 10 dokumen sudah disinkronkan versi PRD-nya ke **v1.1** (per revisi terakhir). Backend Blueprint dan Endpoints Spec sudah di versi **v1.1** masing-masing (migrasi 0006 + constraint di-backport ke Blueprint §6; framing status test suite diselaraskan di kedua dokumen). Timeline & Milestones §9 poin 2 sudah ditandai selesai — tidak ada lagi selisih terbuka antara estimasi PRD dan tabel SOW. Frontend Logic dan UI Template Spec sudah masuk sebagai referensi resmi (§1 baris 9–10) — referensi PRD di Frontend Logic sudah disinkronkan ke v1.1. Kebijakan pemakaian skill desain eksternal (Impeccable/Taste Skill/UI UX Pro Max, §2.3) dan testing Playwright (§9) sudah ditetapkan.

**Item terbuka yang masih genuinely berstatus open:**
- **Test suite formal** (trigger: mulai begitu scope proyek bertambah — lihat Backend Blueprint §10.2, Endpoints Spec item #7, Frontend Logic item #5). Playwright untuk QA visual/aksesibilitas (§9) **tidak otomatis menutup** item ini.
- **Backport ke TSD §4.2** soal pemakaian `GET /api/admin/riwayat?limit=1` untuk ringkasan Dashboard S6 (Frontend Logic item #3) — direkomendasikan tapi belum diterapkan, mengikuti pola yang sama seperti gap Backend Blueprint §6 yang sudah diselesaikan sebelumnya. Kalau ingin diselesaikan, tanyakan eksplisit — jangan diasumsikan sudah beres hanya karena polanya familiar.
