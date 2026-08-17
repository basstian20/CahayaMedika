import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-scoped client (konteks `authenticated`), BUKAN service_role —
// keputusan final Backend Blueprint §10.1 poin 2: RLS harus tetap jadi
// lapisan otorisasi kedua, bukan di-bypass oleh repository write.
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {}, // Route Handler tidak perlu set cookie baru di sini
        remove: () => {},
      },
    }
  );
}
