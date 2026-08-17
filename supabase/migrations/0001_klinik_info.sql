-- Klinik Cahaya Medika — 0001_klinik_info
-- Singleton table: hanya 1 baris (TSD §5.1). Tidak ada enforcement DB untuk
-- "hanya 1 baris" (mis. check constraint) — dikelola secara konvensi aplikasi,
-- konsisten dengan skala proyek 1 developer/1 klinik.

create table if not exists public.klinik_info (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  alamat text not null,
  telepon text not null,
  koordinat_lat double precision not null,
  koordinat_lng double precision not null,
  tahun_berdiri integer not null,
  jam_operasional_default jsonb not null default '{"jam_mulai": "08:00", "jam_selesai": "20:00"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.klinik_info enable row level security;

-- SELECT terbuka untuk anon (Server Component publik, TSD §7.1)
create policy "klinik_info_select_anon" on public.klinik_info
  for select
  to anon, authenticated
  using (true);

-- Write hanya untuk role authenticated (1 admin) — RLS lapisan otorisasi utama
create policy "klinik_info_write_authenticated" on public.klinik_info
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
