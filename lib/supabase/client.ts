"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser client — dipakai untuk login (signInWithPassword) dan baca session
// client-side. BUKAN untuk write data admin (itu lewat Route Handler yang
// sudah pakai session-scoped server client, TSD §4.1, lib/supabase/server.ts).
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
