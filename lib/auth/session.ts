import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Session } from "@supabase/supabase-js";

// Ambil & validasi Supabase session dari request Route Handler — Blueprint §4 modul Auth
export async function verifySession(): Promise<Session | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}
