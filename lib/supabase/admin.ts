import { createClient } from "@supabase/supabase-js";

// service_role client — RESERVED, tidak dipanggil modul bisnis manapun
// (Backend Blueprint §10.1 poin 2, §8). Hanya untuk operasional non-bisnis
// (migrasi data, tooling internal) yang genuinely butuh bypass RLS.
// SUPABASE_SERVICE_ROLE_KEY hanya dipakai server-side, tidak pernah masuk client bundle.
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
