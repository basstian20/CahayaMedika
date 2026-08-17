-- Klinik Cahaya Medika — 0004_jadwal_praktik
-- unique constraint (dokter_id, hari) dibutuhkan oleh ON CONFLICT ON CONSTRAINT
-- di migrasi 0006 (fn_update_jadwal_dan_riwayat) — Backend Blueprint §6.

create table if not exists public.jadwal_praktik (
  id uuid primary key default gen_random_uuid(),
  dokter_id uuid not null references public.dokter (id) on delete cascade,
  hari text not null check (hari in ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu')),
  jam_mulai time not null,
  jam_selesai time not null,
  updated_at timestamptz not null default now(),
  constraint jadwal_praktik_dokter_hari_unique unique (dokter_id, hari)
);

alter table public.jadwal_praktik enable row level security;

create policy "jadwal_praktik_select_anon" on public.jadwal_praktik
  for select
  to anon, authenticated
  using (true);

create policy "jadwal_praktik_write_authenticated" on public.jadwal_praktik
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
