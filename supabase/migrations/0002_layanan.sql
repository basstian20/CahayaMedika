-- Klinik Cahaya Medika — 0002_layanan
-- Hard-delete (bukan soft-delete) — keputusan final TSD §5.3.

create table if not exists public.layanan (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  deskripsi text not null default '',
  urutan integer not null default 0,
  tampil_di_homepage boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.layanan enable row level security;

create policy "layanan_select_anon" on public.layanan
  for select
  to anon, authenticated
  using (true);

create policy "layanan_write_authenticated" on public.layanan
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
