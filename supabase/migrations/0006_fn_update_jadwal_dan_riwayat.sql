-- Klinik Cahaya Medika — 0006_fn_update_jadwal_dan_riwayat
-- Postgres function dipanggil via .rpc() dari jadwal.repository.ts — menjamin
-- atomicity upsert jadwal_praktik + insert riwayat_perubahan dalam SATU
-- transaction Postgres asli (Backend Blueprint §10.1 poin 5). Bergantung pada
-- constraint jadwal_praktik_dokter_hari_unique (migrasi 0004) untuk
-- ON CONFLICT ON CONSTRAINT.
--
-- security definer: dipanggil lewat session-scoped client (authenticated),
-- tapi function perlu insert ke riwayat_perubahan dengan admin_id dari
-- p_admin_id yang divalidasi caller (requireAdmin() sudah memverifikasi
-- session sebelum RPC ini dipanggil) — RLS pada kedua tabel tetap berlaku
-- untuk role authenticated pemanggil.

create or replace function public.fn_update_jadwal_dan_riwayat(
  p_jadwal jsonb,
  p_admin_id uuid,
  p_ringkasan text
) returns integer
language plpgsql
security invoker
as $$
declare
  v_item jsonb;
  v_count integer := 0;
begin
  for v_item in select * from jsonb_array_elements(p_jadwal)
  loop
    insert into public.jadwal_praktik (dokter_id, hari, jam_mulai, jam_selesai, updated_at)
    values (
      (v_item->>'dokter_id')::uuid,
      v_item->>'hari',
      (v_item->>'jam_mulai')::time,
      (v_item->>'jam_selesai')::time,
      now()
    )
    on conflict on constraint jadwal_praktik_dokter_hari_unique
    do update set
      jam_mulai = excluded.jam_mulai,
      jam_selesai = excluded.jam_selesai,
      updated_at = excluded.updated_at;

    v_count := v_count + 1;
  end loop;

  insert into public.riwayat_perubahan (admin_id, jenis_perubahan, ringkasan)
  values (p_admin_id, 'jadwal', p_ringkasan);

  return v_count;
end;
$$;
