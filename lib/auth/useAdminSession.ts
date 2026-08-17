"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface AdminSessionState {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

// Dipakai tiap screen admin (S5-S9) untuk tahu status login saat ini di client.
// Ini lapisan UX (redirect, tampilkan spinner) — enforcement sesungguhnya
// tetap di server per-request (CLAUDE.md §2.1 — "Guard frontend adalah UX").
export function useAdminSession(): AdminSessionState {
  const [state, setState] = useState<AdminSessionState>({
    session: null,
    status: "loading",
  });

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ session, status: session ? "authenticated" : "unauthenticated" });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, status: session ? "authenticated" : "unauthenticated" });
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return state;
}
