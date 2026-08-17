# Backend Blueprint — Landing Page Klinik Cahaya Medika

> **Dokumen ini bukan Tech Spec, dan bukan kode.** Ini adalah lapisan berikutnya setelah Tech Spec — menjawab *file mana, di folder mana, isinya apa* — bukan *bagaimana sistem ini bekerja secara arsitektural* (itu sudah dijawab Tech Spec) dan bukan pula implementasi (`method body`, business logic, query SQL riil) itu tugas developer/Claude Code saat scaffolding, bukan dokumen ini.

| Field | Detail |
|---|---|
| Versi Dokumen | v1.1 — direvisi dari baseline awal: Migration Order §6 dilengkapi migrasi 0006 + dua nama constraint (backport dari Endpoints Spec item #3/#5), dan framing status "test suite" §10.2 diselaraskan dengan Endpoints Spec item #7 |
| Dibangun dari | **Technical Spec** — Klinik Cahaya Medika Technical Spec (monolith tipis Next.js 14+ App Router + Supabase, region Singapore, on-demand ISR) |
| Referensi silang lain | PRD v1.1 (§4 fitur/role), SOW (Fixed-price, ilustratif), User Flow & Wireframe (9 screen S1–S9), Deployment & Maintenance Plan (environment strategy §2, akses §10–11), Endpoints Implementation Spec (migrasi 0006 + constraint, di-backport ke §6) |
| Proyek | Klinik Cahaya Medika — studi kasus ilustratif/template internal NobleDev, bukan klien nyata |
| Framework/bahasa | **Next.js 14+ (App Router), TypeScript**, Route Handlers sebagai lapisan API tipis — sesuai TSD §2/§3.1. Validasi request memakai **Zod** — **diputuskan** dari sudut pandang Backend Engineer, lihat §10.1 poin 1 |
| Backend-as-a-service | **Supabase** (Postgres + Auth + Storage + Row Level Security) — TSD §2, §3.1, §7.1 |
| Tipe proyek | Greenfield, monolith tipis, 1 developer solo — TSD cover, §3.1 |
| Status | Draft — Template Internal. 5 dari 6 asumsi awal sudah diputuskan (lihat §10.1); Migration Order §6 sudah disinkronkan dengan Endpoints Spec; siap dipakai sebagai starting map untuk scaffolding |

---

## Yang TIDAK termasuk di dokumen ini

- Tidak ada method body, business logic, atau kode implementasi — hanya nama file dan tanggung jawabnya.
- Tidak ada SQL migrasi yang bisa langsung dijalankan — hanya struktur tabel/kolom/FK di level perencanaan (lihat §6).
- Tidak ada kode test — hanya catatan di mana test tiap modul sebaiknya diletakkan.
- Tidak ada secret/kredensial/nilai config nyata — hanya *nama* env var.

---

## 1. Cara Pakai Dokumen Ini

Dokumen ini untuk siapa pun (developer manusia atau Claude Code) yang membuka repo ini pertama kali dan perlu tahu di mana tiap bagian arsitektur TSD "hidup" di kode. Baca urutan ini: §2 (peta modul) → §3 (struktur folder) → §4 (detail per modul) → §5 (endpoint-to-file) → §6 (urutan migrasi) sebelum mulai menulis file apa pun. Untuk detail *logika bisnis* (kapan status buka/tutup dihitung, kenapa on-demand ISR dipilih, dsb.), tetap rujuk balik ke Tech Spec §3–§5 — dokumen ini tidak mengulang penjelasan itu, hanya memetakannya ke lokasi file.

Kalau proyek ini nanti punya `CLAUDE.md` sebagai bridge file untuk Claude Code, cukup tunjuk ke dokumen ini (mis. `"Lihat docs/Klinik_Cahaya_Medika_Backend_Blueprint.md untuk struktur modul sebelum scaffold kode baru"`) — jangan duplikasi isinya ke `CLAUDE.md`.

---

## 2. Module Map

| Modul | Tujuan Bisnis | Entitas Utama | Depends on |
|---|---|---|---|
| **Auth & Session** | Login admin (1 akun), verifikasi session di tiap Route Handler admin — TSD §4.1, §7.1 | `auth.users` (native Supabase, tanpa tabel kustom) | — (dipakai semua modul admin) |
| **Klinik Info** (public content) | Menyediakan data profil klinik, layanan, dokter, jadwal untuk dirender Server Component saat page generation/revalidation — TSD §3.3, §4.1 | `klinik_info`, `layanan`, `dokter`, `jadwal_praktik` (baca saja, lewat RLS) | — |
| **Layanan** (admin write) | Admin tambah/edit/hapus daftar layanan — PRD §4 Modul 2, Wireframe S8 | `layanan` | Auth & Session, Riwayat Perubahan, Revalidation |
| **Dokter** (admin write) | Admin update profil dokter + upload foto — PRD §4 Modul 2, Wireframe S8 | `dokter` | Auth & Session, Riwayat Perubahan, Revalidation, Supabase Storage |
| **Jadwal** (admin write) | Admin update jadwal praktik mingguan — PRD §4 Modul 3, Wireframe S7 | `jadwal_praktik` | Auth & Session, Riwayat Perubahan, Revalidation, Dokter (FK) |
| **Riwayat Perubahan** (audit log) | Catat siapa/kapan/apa yang berubah; tampilkan log ke admin — PRD §4 Modul 6, Wireframe S9 | `riwayat_perubahan` | Auth & Session |
| **Revalidation** (cross-cutting, bukan modul bisnis) | Trigger on-demand ISR (`revalidatePath`) setelah tiap write admin sukses — TSD §3.3–§3.4 (keputusan arsitektur kunci untuk memenuhi SOW §8) | — | Dipanggil oleh Layanan, Dokter, Jadwal |

**Catatan:** Modul 5 PRD (SEO & Structured Data) sengaja tidak muncul sebagai modul backend terpisah — sesuai TSD §4.1, ini murni markup yang dirender di Server Component halaman publik, tidak ada endpoint atau logic backend tersendiri. Dicatat di §7 (Cross-cutting) sebagai bagian dari lapisan render, bukan modul API.

---

## 3. Repository Layout

```text
klinik-cahaya-medika/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx              # Layout publik: header, footer, anchor nav (S1-S4)
│   │   └── page.tsx                # Homepage — Server Component, SSG + on-demand ISR (S1-S4)
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx            # S5 — Client Component (form + signInWithPassword)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # S6 — hub navigasi 3 kartu
│   │   ├── jadwal/
│   │   │   └── page.tsx            # S7 — form edit jadwal
│   │   ├── layanan/
│   │   │   └── page.tsx            # S8 (bagian layanan) — form edit daftar layanan
│   │   ├── dokter/
│   │   │   └── page.tsx            # S8 (bagian dokter) — form edit profil + upload foto
│   │   └── riwayat/
│   │       └── page.tsx            # S9 — tabel log read-only
│   └── api/
│       └── admin/
│           ├── jadwal/
│           │   └── route.ts        # PATCH /api/admin/jadwal
│           ├── layanan/
│           │   └── route.ts        # PATCH /api/admin/layanan
│           ├── dokter/
│           │   ├── route.ts        # PATCH /api/admin/dokter
│           │   └── foto/
│           │       └── route.ts    # POST /api/admin/dokter/foto
│           └── riwayat/
│               └── route.ts        # GET /api/admin/riwayat
├── lib/
│   ├── supabase/
│   │   ├── server.ts                # factory: Supabase client sisi server (Route Handler, Server Component)
│   │   ├── client.ts                # factory: Supabase client sisi browser (dipakai S5 login)
│   │   └── admin.ts                 # factory: client dengan service_role key — HANYA dipakai server-side
│   ├── modules/
│   │   ├── klinik-info/
│   │   │   ├── klinik-info.repository.ts
│   │   │   └── klinik-info.types.ts
│   │   ├── layanan/
│   │   │   ├── layanan.service.ts
│   │   │   ├── layanan.repository.ts
│   │   │   ├── layanan.schema.ts
│   │   │   └── layanan.types.ts
│   │   ├── dokter/
│   │   │   ├── dokter.service.ts
│   │   │   ├── dokter.repository.ts
│   │   │   ├── dokter.schema.ts
│   │   │   ├── dokter-foto.service.ts   # wrapper upload ke Supabase Storage
│   │   │   └── dokter.types.ts
│   │   ├── jadwal/
│   │   │   ├── jadwal.service.ts
│   │   │   ├── jadwal.repository.ts
│   │   │   ├── jadwal.schema.ts
│   │   │   └── jadwal.types.ts
│   │   └── riwayat/
│   │       ├── riwayat.service.ts
│   │       ├── riwayat.repository.ts
│   │       └── riwayat.types.ts
│   ├── auth/
│   │   ├── session.ts               # verifySession() — dipakai tiap Route Handler admin
│   │   └── guards.ts                # requireAdmin() guard helper
│   ├── revalidation/
│   │   └── revalidate-public.ts     # wrapper revalidatePath('/') + logging sukses/gagal
│   └── shared/
│       ├── response.ts              # JSON response envelope standar (success/error)
│       ├── errors.ts                # kelas error terstandar (UnauthorizedError, ValidationError, dst.)
│       └── logger.ts                # logging util (dipakai revalidation §6 Deployment Plan)
├── middleware.ts                     # Next.js middleware — proteksi /admin/* kecuali /admin/login
├── supabase/
│   └── migrations/
│       ├── 0001_klinik_info.sql
│       ├── 0002_layanan.sql
│       ├── 0003_dokter.sql
│       ├── 0004_jadwal_praktik.sql
│       ├── 0005_riwayat_perubahan.sql
│       └── 0006_fn_update_jadwal_dan_riwayat.sql   # Postgres function, dipanggil via .rpc() — lihat §6
└── tests/
    └── modules/                      # lihat §7 — lokasi test per modul, isinya belum ditulis skill ini
```

---

## 4. Per-Module Blueprint

### Modul: `Auth & Session`

Tidak punya endpoint kustom sendiri (TSD §4.1: login memakai Supabase Auth SDK langsung dari client, bukan custom endpoint) — modul ini murni helper yang dipakai modul lain.

| Layer | File/Class | Responsibility | Depends on |
|---|---|---|---|
| Session verifier | `lib/auth/session.ts` — `verifySession(req)` | Ambil & validasi Supabase session token dari request Route Handler; return session atau `null` | `lib/supabase/server.ts` |
| Guard | `lib/auth/guards.ts` — `requireAdmin(req)` | Bungkus `verifySession`, lempar `UnauthorizedError` (401) kalau tidak valid — dipanggil di awal tiap Route Handler admin | `session.ts`, `lib/shared/errors.ts` |
| Middleware | `middleware.ts` — matcher `/admin/:path*` kecuali `/admin/login` | Redirect ke `/admin/login` kalau belum ada session valid saat akses halaman admin (proteksi level halaman, terpisah dari proteksi level API di atas) | `lib/supabase/server.ts` |

---

### Modul: `Klinik Info` (public content, read-only)

Tidak melalui Route Handler — Server Component query langsung ke Supabase via `anon key` + RLS publik (TSD §4.1). Dicatat di sini agar developer tahu di mana logic pengambilan data publik hidup.

| Layer | File/Class | Responsibility | Depends on |
|---|---|---|---|
| Repository | `lib/modules/klinik-info/klinik-info.repository.ts` — `getKlinikInfo()`, `getLayananPublik()`, `getDokterPublik()`, `getJadwalPublik()` | Query read-only ke `klinik_info`, `layanan`, `dokter`, `jadwal_praktik` untuk dipanggil dari `app/(public)/page.tsx` saat generation/revalidation | `lib/supabase/server.ts` (anon client, bukan admin client) |
| Types | `lib/modules/klinik-info/klinik-info.types.ts` | Tipe TypeScript untuk hasil query (`KlinikInfo`, `LayananPublik`, dst.) | — |

*Catatan: status "Buka Sekarang"/"Tutup" **tidak** dihitung di repository ini — TSD §3.3 eksplisit memutuskan perhitungan itu terjadi client-side di browser dari data mentah jadwal, bukan di server. Repository ini hanya mengembalikan data jadwal mentah.*

---

### Modul: `Layanan`

```text
lib/modules/layanan/
├── layanan.service.ts       # orkestrasi: validasi -> repository write -> catat riwayat -> trigger revalidate
├── layanan.repository.ts    # query Supabase murni (insert/update/delete tabel layanan)
├── layanan.schema.ts        # Zod schema untuk body PATCH /api/admin/layanan
└── layanan.types.ts
```

| Layer | File/Class | Responsibility | Depends on |
|---|---|---|---|
| Route Handler | `app/api/admin/layanan/route.ts` — `PATCH` | Terima request, panggil `requireAdmin()`, parse+validasi body via `layanan.schema.ts`, panggil `layanan.service.ts`, kembalikan response via `response.ts` | Auth guard, `layanan.service.ts` |
| Service | `lib/modules/layanan/layanan.service.ts` — `updateLayanan(input, adminId)` | Orkestrasi: panggil repository untuk write, panggil Riwayat Perubahan untuk insert log, panggil `revalidate-public.ts` setelah write sukses | `layanan.repository.ts`, `riwayat.service.ts`, `revalidate-public.ts` |
| Repository | `lib/modules/layanan/layanan.repository.ts` — `upsertLayanan()`, `deleteLayanan()` | Query Supabase murni ke tabel `layanan`, tanpa logic bisnis | `lib/supabase/server.ts` — **session-scoped client (konteks `authenticated`), bukan admin client** — keputusan final, lihat §10.1 poin 2 |
| Schema (validation) | `lib/modules/layanan/layanan.schema.ts` — `updateLayananSchema` | Validasi body request (nama, deskripsi, urutan, tampil_di_homepage) sebelum masuk service | Zod |
| Response transformer | Ditangani lewat `lib/shared/response.ts` (bersama, bukan per-modul) | — | — |

---

### Modul: `Dokter`

```text
lib/modules/dokter/
├── dokter.service.ts        # orkestrasi update profil dokter
├── dokter-foto.service.ts   # wrapper upload foto ke Supabase Storage (lihat §8)
├── dokter.repository.ts     # query Supabase murni ke tabel dokter
├── dokter.schema.ts         # Zod schema untuk body PATCH /api/admin/dokter
└── dokter.types.ts
```

| Layer | File/Class | Responsibility | Depends on |
|---|---|---|---|
| Route Handler | `app/api/admin/dokter/route.ts` — `PATCH` | Update profil dokter (nama, spesialisasi) | Auth guard, `dokter.service.ts` |
| Route Handler | `app/api/admin/dokter/foto/route.ts` — `POST` | Terima file upload, validasi ukuran/tipe MIME (TSD §9 risiko), panggil `dokter-foto.service.ts`, kembalikan URL publik | Auth guard, `dokter-foto.service.ts` |
| Service | `lib/modules/dokter/dokter.service.ts` — `updateDokter(input, adminId)` | Orkestrasi write profil dokter + catat riwayat + trigger revalidate | `dokter.repository.ts`, `riwayat.service.ts`, `revalidate-public.ts` |
| Service (integration wrapper) | `lib/modules/dokter/dokter-foto.service.ts` — `uploadFotoDokter(file, dokterId)` | Validasi file, upload ke Supabase Storage lewat `DokterFotoStorageClient` (§8), update kolom `foto_url` di tabel `dokter`, catat riwayat, trigger revalidate | `dokter.repository.ts`, Supabase Storage wrapper (§8), `riwayat.service.ts` |
| Repository | `lib/modules/dokter/dokter.repository.ts` — `updateDokterProfil()`, `updateFotoUrl()` | Query Supabase murni ke tabel `dokter` | `lib/supabase/server.ts` — session-scoped client (konteks `authenticated`), sama seperti modul Layanan, §10.1 poin 2 |
| Schema | `lib/modules/dokter/dokter.schema.ts` — `updateDokterSchema`, `uploadFotoSchema` (ukuran max, MIME whitelist) | Validasi input | Zod |

---

### Modul: `Jadwal`

```text
lib/modules/jadwal/
├── jadwal.service.ts
├── jadwal.repository.ts
├── jadwal.schema.ts
└── jadwal.types.ts
```

| Layer | File/Class | Responsibility | Depends on |
|---|---|---|---|
| Route Handler | `app/api/admin/jadwal/route.ts` — `PATCH` | Sesuai TSD §4.3 — terima array `jadwal[]`, validasi, panggil service | Auth guard, `jadwal.service.ts` |
| Service | `lib/modules/jadwal/jadwal.service.ts` — `updateJadwal(input, adminId)` | Orkestrasi: upsert jadwal per dokter/hari (TSD §4.3 request shape), insert riwayat, trigger `revalidatePath('/')` — **ini jalur kritis SOW §8**, response harus mengandung `revalidated: boolean` sesuai contoh response TSD §4.3 | `jadwal.repository.ts`, `riwayat.service.ts`, `revalidate-public.ts` |
| Repository | `lib/modules/jadwal/jadwal.repository.ts` — `upsertJadwalBatch()` | Upsert batch ke tabel `jadwal_praktik` **lewat Postgres function `fn_update_jadwal_dan_riwayat` dipanggil via `.rpc()`** — menjamin atomicity write jadwal + insert riwayat dalam satu transaction sungguhan (TSD §3.3 langkah 4). Keputusan final, lihat §10.1 poin 5 | `lib/supabase/server.ts` (session-scoped, §10.1 poin 2), Postgres function di `supabase/migrations/` |
| Schema | `lib/modules/jadwal/jadwal.schema.ts` — `updateJadwalSchema` | Validasi array jadwal: `dokter_id` (uuid), `hari` (enum Senin–Minggu), `jam_mulai`/`jam_selesai` (format waktu valid) — sesuai request body TSD §4.3 | Zod |

---

### Modul: `Riwayat Perubahan`

```text
lib/modules/riwayat/
├── riwayat.service.ts
├── riwayat.repository.ts
└── riwayat.types.ts
```

| Layer | File/Class | Responsibility | Depends on |
|---|---|---|---|
| Route Handler | `app/api/admin/riwayat/route.ts` — `GET` | Terima query `?page=&limit=`, panggil service, kembalikan response sesuai shape TSD §4.3 (`data[]`, `page`, `has_more`) | Auth guard, `riwayat.service.ts` |
| Service | `lib/modules/riwayat/riwayat.service.ts` — `listRiwayat(page, limit)`, `catatPerubahan(adminId, jenis, ringkasan)` | `listRiwayat` dipanggil Route Handler GET; `catatPerubahan` dipanggil modul lain (Layanan/Dokter/Jadwal) setelah write sukses — **tanpa filter tanggal**, sesuai keputusan UX Wireframe §5 poin 6 | `riwayat.repository.ts` |
| Repository | `lib/modules/riwayat/riwayat.repository.ts` — `insertRiwayat()`, `paginateRiwayat()` | Query Supabase murni ke tabel `riwayat_perubahan`, urutan reverse-chronological | `lib/supabase/server.ts` |

---

## 5. Endpoint-to-File Mapping

| Method + Path | Route Handler | Service method dipanggil | Auth/Role |
|---|---|---|---|
| `PATCH /api/admin/jadwal` | `app/api/admin/jadwal/route.ts` | `jadwal.service.ts` → `updateJadwal()` | Admin (session Supabase, `requireAdmin`) |
| `PATCH /api/admin/layanan` | `app/api/admin/layanan/route.ts` | `layanan.service.ts` → `updateLayanan()` | Admin |
| `PATCH /api/admin/dokter` | `app/api/admin/dokter/route.ts` | `dokter.service.ts` → `updateDokter()` | Admin |
| `POST /api/admin/dokter/foto` | `app/api/admin/dokter/foto/route.ts` | `dokter-foto.service.ts` → `uploadFotoDokter()` | Admin |
| `GET /api/admin/riwayat` | `app/api/admin/riwayat/route.ts` | `riwayat.service.ts` → `listRiwayat()` | Admin |

*Tidak ada endpoint publik custom — seluruh GET data publik (layanan, jadwal, kontak) ditangani via Server Component + `klinik-info.repository.ts` langsung, bukan lewat Route Handler (TSD §4.1, §4.2 catatan "Skip CRUD publik").*

---

## 6. Migration Order

*Diperbarui menyusul keputusan Endpoints Implementation Spec (item #3, #5, dan referensi bucket Storage) — lihat catatan revisi di akhir bagian ini.*

| Order | Migration | Table/Object | Key Columns / Constraints | FKs to |
|---|---|---|---|---|
| 1 | `0001_klinik_info.sql` | `klinik_info` | `id`, `nama`, `alamat`, `telepon`, `koordinat_lat`, `koordinat_lng`, `tahun_berdiri`, `jam_operasional_default (jsonb)` | — |
| 2 | `0002_layanan.sql` | `layanan` | `id`, `nama`, `deskripsi`, `urutan`, `tampil_di_homepage`, `updated_at` | — |
| 3 | `0003_dokter.sql` | `dokter` | `id`, `nama`, `spesialisasi`, `foto_url`, `urutan`, `updated_at` | — |
| 4 | `0004_jadwal_praktik.sql` | `jadwal_praktik` | `id`, `dokter_id`, `hari`, `jam_mulai`, `jam_selesai`, `updated_at`; **unique constraint `jadwal_praktik_dokter_hari_unique` pada `(dokter_id, hari)`** — ditambahkan menyusul kebutuhan `ON CONFLICT ON CONSTRAINT` di migrasi 6 | `dokter_id` → `dokter.id` |
| 5 | `0005_riwayat_perubahan.sql` | `riwayat_perubahan` | `id`, `admin_id`, `jenis_perubahan`, `ringkasan`, `created_at`; **FK constraint bernama eksplisit `riwayat_perubahan_admin_id_fkey`** — nama ini dirujuk PostgREST untuk auto-generate alias join `admin:admin_id(email)` yang dipakai `riwayat.repository.ts` (§4 modul Riwayat Perubahan) | `admin_id` → `auth.users.id` (native Supabase Auth, bukan tabel kustom) |
| 6 | `0006_fn_update_jadwal_dan_riwayat.sql` | Postgres function (bukan tabel baru) | `fn_update_jadwal_dan_riwayat(p_jadwal jsonb, p_admin_id uuid, p_ringkasan text) RETURNS integer` — upsert `jadwal_praktik` + insert `riwayat_perubahan` dalam satu transaction, dipanggil lewat `supabase.rpc()` dari `jadwal.repository.ts` (keputusan final §10.1 poin 5). **Bergantung pada** constraint `jadwal_praktik_dokter_hari_unique` (migrasi 4) untuk klausa `ON CONFLICT ON CONSTRAINT` di dalam function | — (function, bukan FK tabel) |

*Urutan ini mengikuti ER diagram TSD §5.2 — `dokter` harus ada sebelum `jadwal_praktik` (FK), `riwayat_perubahan` bisa dibuat kapan saja setelah `auth.users` tersedia (native, selalu ada sejak project Supabase dibuat), dan migrasi 6 (function) harus setelah migrasi 4 dan 5 karena bergantung pada constraint di keduanya.*

**Row Level Security (RLS) — dicatat per migrasi, bukan migrasi terpisah:** setiap migrasi tabel publik (`klinik_info`, `layanan`, `dokter`, `jadwal_praktik`) harus menyertakan policy `SELECT` terbuka untuk role `anon`, dan `INSERT/UPDATE/DELETE` untuk role `authenticated` yang cocok UID admin — sesuai TSD §7.1. Migrasi `riwayat_perubahan` menyertakan policy `SELECT`+`INSERT` khusus `authenticated`, tidak pernah `anon`.

**Supabase Storage bucket `dokter-foto`** (§8, §10.1 poin 3) **bukan bagian dari migrasi SQL bernomor di atas** — provisioning bucket dilakukan lewat Supabase Dashboard atau Supabase CLI storage config terpisah (`supabase/config.toml` / dashboard), bukan file `.sql` di `migrations/`. Dicatat eksplisit di sini agar tidak ada yang mencari file migrasi ke-7 yang tidak ada.

> **Catatan revisi:** Migrasi 6 dan dua nama constraint di atas sebelumnya hanya disebutkan di `Klinik_Cahaya_Medika_Endpoints_Spec.md` (item Terbuka — Sudah Dijawab #3 dan #5) tanpa di-backport ke Migration Order resmi di sini — dokumen itu bahkan secara eksplisit merekomendasikan revisi ini ("Perubahan pada ... Blueprint §6 (item 3, 5) direkomendasikan sebagai revisi terdokumentasi terpisah"). Tabel di atas sekarang jadi sumber kebenaran tunggal untuk urutan migrasi; kalau Endpoints Spec direvisi lagi ke depan, sinkronkan balik ke sini.

---

## 7. Cross-Cutting Concerns

- **Response envelope:** `lib/shared/response.ts` menyediakan `successResponse(data)` dan `errorResponse(code, message)` — dipakai semua Route Handler agar shape response konsisten dengan contoh TSD §4.3 (`{ success, ... }` / `{ success: false, error, message }`).
- **Error handling:** `lib/shared/errors.ts` — kelas `UnauthorizedError` (→ 401), `ValidationError` (→ 400), `NotFoundError` (→ 404), `InternalError` (→ 500). Route Handler membungkus service call dalam try-catch, memetakan kelas error ke status code lewat helper bersama, bukan menulis if/else status code manual di tiap Route Handler.
- **Auth middleware & role check:** Hanya ada 1 role (`admin`) sesuai PRD §3 — tidak ada RBAC bertingkat (TSD §4.1). `requireAdmin()` (§4 modul Auth) adalah satu-satunya guard yang perlu ada; tidak perlu sistem permission granular.
- **Revalidation wrapper:** `lib/revalidation/revalidate-public.ts` — `revalidatePublicHomepage()` membungkus `revalidatePath('/')` dalam try-catch, memanggil `lib/shared/logger.ts` untuk mencatat sukses/gagal secara eksplisit — mengimplementasikan rekomendasi Deployment & Maintenance Plan §6/§12.2 poin 2 di level file. Kegagalan **tidak** menggagalkan response sukses ke admin (write DB tetap dianggap berhasil), tapi tercatat di log untuk investigasi/retry manual — konsisten dengan mitigasi risiko TSD §9 baris pertama. Dipanggil dari `layanan.service.ts`, `dokter.service.ts`, `jadwal.service.ts` setelah write sukses. Keputusan final, lihat §10.1 poin 4.
- **Validasi:** Setiap modul admin punya `*.schema.ts` sendiri (Zod) — tidak ada base schema class bersama karena tiap modul punya shape berbeda, tapi pola pemanggilannya konsisten (`schema.parse(body)` di awal Route Handler, sebelum masuk service).
- **Logging:** `lib/shared/logger.ts` — wrapper tipis di atas `console.log`/`console.error` terstruktur (JSON), cukup untuk dibaca lewat Vercel function logs (TSD §6, Deployment Plan §6) — tidak perlu library logging eksternal untuk skala proyek ini `[ASUMSI: konsisten dengan keputusan anti-over-engineering TSD §2/§3.1]`.
- **SEO/Structured Data (PRD Modul 5):** Tidak punya modul/file backend sendiri — schema.org markup (`LocalBusiness`/`MedicalClinic`) di-render langsung di `app/(public)/page.tsx` atau komponen JSON-LD kecil di dalamnya, mengambil data dari `klinik-info.repository.ts`. Dicatat di sini agar tidak ada yang mencari "modul SEO" yang sebetulnya tidak ada.

---

## 8. External Integration Wrappers

| Integrasi | Modul pemilik | Wrapper class/service | Env var (nama saja) |
|---|---|---|---|
| Supabase (Postgres + Auth), koneksi server-side | Semua modul (lewat `lib/supabase/server.ts`) | `createServerSupabaseClient()` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase, koneksi dengan `service_role` | **Reserved, tidak dipanggil modul manapun saat ini** — keputusan §10.1 poin 2 menetapkan seluruh write modul bisnis memakai session-scoped client, bukan `service_role`. Wrapper ini tetap disiapkan untuk kebutuhan operasional di luar modul bisnis (mis. script migrasi data, admin tooling internal) yang genuinely butuh bypass RLS | `createAdminSupabaseClient()` — `lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` — **hanya** dipakai server-side, tidak pernah masuk client bundle (TSD §7.4) |
| Supabase Auth, koneksi sisi browser | Modul Auth & Session (dipakai `app/admin/login/page.tsx`) | `createBrowserSupabaseClient()` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase Storage (foto profil dokter) | Modul Dokter | `DokterFotoStorageClient` — `lib/modules/dokter/dokter-foto.service.ts` (nama class isolasi eksplisit, sesuai prinsip wrapper skill ini) | Tidak ada env var tambahan — pakai kredensial Supabase yang sama; bucket **`dokter-foto`** — keputusan final, lihat §10.1 poin 3 |
| WhatsApp `wa.me` link | Bukan integrasi backend — link statis dibangun di komponen frontend (`buildWhatsAppLink(nomor, pesan)`), tidak menyentuh backend NobleDev sama sekali (TSD §7.2, §10) | — (bukan wrapper backend) | — |

---

## 9. Background Jobs & Queues

**Tidak ada** — TSD §2 eksplisit: "Tidak ada scope yang butuh proses asinkron/terjadwal." Section ini sengaja di-skip sesuai prinsip anti-over-engineering yang sama yang dipakai TSD.

---

## 10. Open Items Carried Into Implementation

### 10.1 Item Terbuka — Sudah Dijawab

*Lima dari enam asumsi draft sebelumnya ditutup di bawah ini dengan keputusan final + peran yang paling relevan untuk menjawabnya — mengikuti pola yang sama dipakai TSD §9.1 dan Deployment & Maintenance Plan §11/§12.1: sudut pandang berbeda untuk jenis keputusan berbeda (konvensi framework vs. keamanan data vs. penamaan infra vs. arsitektur database). Ini bukan lagi item terbuka untuk developer yang scaffold dari dokumen ini — kalau ingin diubah, perlakukan sebagai revisi terdokumentasi, bukan asumsi diam-diam.*

1. **Library validasi — dijawab dari sudut pandang Backend Engineer.**
   **Keputusan: Zod.** TSD tidak menyebut library validasi spesifik karena berada di luar cakupannya (TSD berhenti di level API contract, bukan implementasi). Zod dipilih karena native TypeScript (tipe request tersimpul otomatis dari schema, tidak perlu tipe ganda), tanpa dependency runtime berat, dan sudah jadi konvensi de-facto untuk validasi di Route Handler Next.js App Router — bukan preferensi pribadi, tapi konvensi framework yang berlaku umum di ekosistem yang sudah dipilih TSD §2. Diterapkan di tiap `*.schema.ts` per modul (§4).

2. **Konteks eksekusi repository write (`authenticated` vs. `service_role`) — dijawab dari sudut pandang Infrastructure/Backend Engineer, merujuk langsung ke TSD §7.1.**
   **Keputusan: session-scoped client (konteks `authenticated`), bukan `service_role`, untuk seluruh repository write modul bisnis** (`layanan.repository.ts`, `dokter.repository.ts`, `jadwal.repository.ts`). TSD §7.1 sudah eksplisit menetapkan RLS sebagai *"lapisan otorisasi utama"* — kebijakan `INSERT/UPDATE/DELETE` khusus role `authenticated` yang cocok UID admin. Kalau repository write memakai `service_role`, RLS itu di-bypass sepenuhnya dan lapisan otorisasi yang sudah dirancang TSD jadi dekoratif, bukan fungsional — request tervalidasi hanya lewat `requireAdmin()` di level aplikasi, tanpa pengecekan kedua di level database. Memakai client bertipe session (dibuat dari cookie/token request yang sama yang divalidasi `requireAdmin()`) menjaga *defense in depth*: kalau suatu saat `requireAdmin()` punya bug, RLS tetap jadi pagar kedua. `service_role` (`createAdminSupabaseClient()`, §8) tetap disiapkan tapi berstatus *reserved* — untuk operasional non-modul-bisnis (migrasi data, tooling internal), bukan default request handler.

3. **Nama bucket Supabase Storage untuk foto dokter — dijawab dari sudut pandang Infrastructure/Backend Engineer.**
   **Keputusan: `dokter-foto`.** TSD tidak menetapkan nama bucket (di luar cakupan level arsitektur), tapi ini murni keputusan penamaan tanpa trade-off substantif — mengikuti konvensi kebab-case yang sama dengan nama tabel (`dokter`), konsisten dengan penamaan resource Supabase lain di proyek ini (schema tabel snake_case → resource-facing kebab-case). Tidak ada alasan menahan ini sebagai open item karena tidak ada opsi bersaing yang genuinely berbeda dampaknya.

4. **Mekanisme logging kegagalan `revalidatePath()` — dijawab dari sudut pandang Infrastructure/Backend Engineer, menutup rekomendasi Deployment & Maintenance Plan §6/§12.2 poin 2 di level file.**
   **Keputusan:** `lib/revalidation/revalidate-public.ts` membungkus `revalidatePath('/')` dalam try-catch, memanggil `lib/shared/logger.ts` untuk mencatat hasil (sukses/gagal) secara terstruktur, dan **tidak** menggagalkan response API ke admin meski revalidation gagal — write DB tetap dilaporkan sukses ke admin, tapi kegagalan revalidation tercatat di log Vercel untuk retry manual/investigasi. Ini persis mitigasi yang sudah dirumuskan TSD §9 baris pertama ("wrap write DB + `revalidatePath()` dalam try-catch dengan logging"); blueprint ini hanya menempatkannya di file spesifik, tidak mengubah kebijakannya.

5. **Mekanisme transaction Postgres untuk `jadwal.repository.ts` — dijawab dari sudut pandang Backend/Database Engineer, karena ini pertanyaan arsitektur data, bukan komersial atau infra murni.**
   **Keputusan: Postgres function (`fn_update_jadwal_dan_riwayat`) dipanggil lewat `supabase.rpc()`**, bukan dua panggilan terpisah dari klien JS dengan manual rollback di level aplikasi. Alasan teknis, bukan preferensi: Supabase JS client tidak menyediakan API transaction multi-statement lintas panggilan — dua `.from().insert()` berturut-turut dari klien selalu jadi dua transaction Postgres terpisah, sehingga "manual rollback di level aplikasi" bukan transaction sungguhan, hanya usaha kompensasi setelah fakta (kalau insert kedua gagal setelah yang pertama sukses, data sudah terlanjur inconsistent sesaat). Function Postgres yang dipanggil lewat RPC berjalan dalam satu transaction database asli — upsert `jadwal_praktik` dan insert `riwayat_perubahan` sukses atau gagal bersama-sama, tanpa window inkonsistensi. Trade-off yang diterima sadar: menambah satu file SQL function di `supabase/migrations/` yang perlu dijaga sinkron dengan schema — kompleksitas kecil dibanding risiko data ganjil pada tabel yang jadi jalur kritis SOW §8.

### 10.2 Item yang Tetap Terbuka

1. **Test suite:** `[ASUMSI, diwarisi TSD §8/Deployment Plan §3]` Belum ada requirement test suite formal — **ini keputusan default dengan trigger yang sudah ditetapkan, bukan celah yang benar-benar tanpa arah, tapi juga belum sepenuhnya closed.** `next build` (type check) tetap satu-satunya hard gate otomatis untuk saat ini. Folder `tests/modules/` disiapkan sebagai lokasi kerja mengikuti struktur `lib/modules/`, tapi isinya genuinely belum ditulis. Trigger yang sudah disepakati: mulai tulis test sungguhan begitu scope proyek bertambah (Deployment Plan §3) — *kapan* persisnya itu terjadi tetap keputusan kapasitas/prioritas tim (Tech Lead/Solutions Architect), bukan fakta arsitektur yang bisa dikunci dari sudut pandang blueprint ini sendiri. **Catatan sinkronisasi:** framing ini diselaraskan dengan `Klinik_Cahaya_Medika_Endpoints_Spec.md` item #7 ("Item yang Tetap Terbuka"), yang sebelumnya menyebut topik ini masih terbuka sementara bagian ini menyebutnya sudah diputuskan di level kebijakan — keduanya sekarang memakai bahasa yang sama: default + trigger eksplisit, bukan "closed" atau "open" secara mutlak.

---

*Dokumen ini siap dipakai sebagai starting map untuk scaffolding — baik oleh developer NobleDev maupun Claude Code. Lima dari enam asumsi awal sudah dikunci sebagai keputusan (§10.1); satu sisanya (test suite, §10.2) sengaja tetap terbuka karena bergantung kapasitas/prioritas tim, bukan fakta teknis. Untuk logika bisnis detail (kapan revalidation dipicu, bagaimana status buka/tutup dihitung, dsb.), tetap rujuk balik ke Technical Spec §3–§5.*
