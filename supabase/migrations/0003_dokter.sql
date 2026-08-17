-- Klinik Cahaya Medika — 0003_dokter

create table if not exists public.dokter (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  spesialisasi text not null,
  foto_url text,
  urutan integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.dokter enable row level security;

create policy "dokter_select_anon" on public.dokter
  for select
  to anon, authenticated
  using (true);

create policy "dokter_write_authenticated" on public.dokter
  for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
