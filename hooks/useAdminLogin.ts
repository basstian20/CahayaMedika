"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LoginStatus = "idle" | "loading" | "error";

// Login lewat Supabase Auth SDK langsung dari client (TSD §4.1) — TIDAK
// lewat Route Handler custom. Pesan error digeneralisasi (Wireframe S5).
export function useAdminLogin() {
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function login(email: string, password: string) {
    setStatus("loading");
    setErrorMessage(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage("Email atau password salah.");
      return;
    }

    setStatus("idle");
    const redirectTo = searchParams.get("redirectedFrom") ?? "/admin";
    router.push(redirectTo);
    router.refresh();
  }

  return { login, status, errorMessage };
}
