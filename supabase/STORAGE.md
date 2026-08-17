# Supabase Storage — bucket `dokter-foto`

Bucket `dokter-foto` **bukan bagian dari migrasi SQL bernomor** di `migrations/` — provisioning
dilakukan lewat Supabase Dashboard atau Supabase CLI storage config, bukan file `.sql`
(Backend Blueprint §6). Ini catatan eksplisit supaya tidak ada yang mencari migrasi ke-7.

Setup manual (Dashboard → Storage → New bucket):

- Nama: `dokter-foto`
- Public bucket: **ya** (foto profil dokter perlu diakses publik lewat `getPublicUrl`)
- File size limit: 2MB (selaras dengan `MAX_FOTO_SIZE_BYTES` di `lib/modules/dokter/dokter.schema.ts`)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
