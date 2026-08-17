-- Klinik Cahaya Medika — 0007_riwayat_perubahan_admin_email_view
--
-- Fix: PostgREST tidak bisa embed auth.users lewat FK join biasa
-- (admin:admin_id(email)) meski FK constraint riwayat_perubahan_admin_id_fkey
-- sudah ada — auth schema tidak diekspos ke PostgREST schema cache untuk
-- embedding. Ditemukan saat testing end-to-end GET /api/admin/riwayat
-- ("Could not find a relationship between 'riwayat_perubahan' and 'admin_id'
-- in the schema cache").
--
-- Solusi: view di public schema yang JOIN ke auth.users langsung lewat SQL
-- (bukan PostgREST embed). View di Postgres berjalan dengan privilege owner
-- (postgres, yang bisa baca auth.users), bukan privilege pemanggil — jadi
-- authenticated role tetap bisa baca admin_email tanpa perlu akses langsung
-- ke auth.users.

create or replace view public.riwayat_perubahan_with_admin as
select
  r.id,
  r.admin_id,
  r.jenis_perubahan,
  r.ringkasan,
  r.created_at,
  u.email as admin_email
from public.riwayat_perubahan r
left join auth.users u on u.id = r.admin_id;

grant select on public.riwayat_perubahan_with_admin to authenticated;
