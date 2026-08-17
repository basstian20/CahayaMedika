import { createClient } from "@supabase/supabase-js";

// Anon client TANPA cookies — dipakai khusus query publik read-only
// (klinik-info.repository.ts) saat page generation/revalidation. Berbeda
// dari lib/supabase/server.ts (session-scoped, dipakai Route Handler admin):
// client ini tidak menyentuh cookies() sama sekali, supaya app/(public)/page.tsx
// tetap bisa di-generate sebagai SSG + on-demand ISR (TSD §3.3-3.4), bukan
// server-rendered per-request seperti Route Handler admin.
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
