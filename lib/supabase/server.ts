import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-scoped client (konteks `authenticated`), BUKAN service_role —
// keputusan final Backend Blueprint §10.1 poin 2: RLS harus tetap jadi
// lapisan otorisasi kedua, bukan di-bypass oleh repository write.
//
// cookies() async sejak Next.js 15 (Upgrading: Version 15) — createServerSupabaseClient()
// ikut jadi async. getAll/setAll dipakai karena get/set/remove sudah deprecated
// di @supabase/ssr (Supabase Docs: Creating a Supabase client for SSR).
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // Route Handler tidak perlu set cookie baru di sini
      },
    }
  );
}
