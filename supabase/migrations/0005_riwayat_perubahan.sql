-- Klinik Cahaya Medika — 0005_riwayat_perubahan
-- FK constraint bernama eksplisit riwayat_perubahan_admin_id_fkey — dirujuk
-- PostgREST untuk auto-generate alias join "admin:admin_id(email)" yang
-- dipakai riwayat.repository.ts (Backend Blueprint §6).

create table if not exists public.riwayat_perubahan (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  jenis_perubahan text not null check (jenis_perubahan in ('jadwal', 'layanan', 'dokter')),
  ringkasan text not null,
  created_at timestamptz not null default now(),
  constraint riwayat_perubahan_admin_id_fkey foreign key (admin_id) references auth.users (id) on delete cascade
);

alter table public.riwayat_perubahan enable row level security;

-- Tidak pernah dibaca/ditulis publik — hanya authenticated (TSD §7.1)
create policy "riwayat_perubahan_select_authenticated" on public.riwayat_perubahan
  for select
  to authenticated
  using (auth.role() = 'authenticated');

create policy "riwayat_perubahan_insert_authenticated" on public.riwayat_perubahan
  for insert
  to authenticated
  with check (auth.role() = 'authenticated');
