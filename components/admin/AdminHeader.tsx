"use client";

import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Header bersama S6-S9, dirender sekali oleh app/admin/(panel)/layout.tsx.
// Navigasi antar modul sekarang lewat AdminSidebar (persisten) — revisi dari
// keputusan "sidebar-free/hub-only" di UI Template Spec §5-§6, lihat Catatan
// Revisi di dokumen tersebut.
export function AdminHeader() {
  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <header className="flex items-center justify-between bg-nakhoda px-6 py-4 text-latar">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-latar p-1">
          <Image src="/images/logo.png" alt="" width={28} height={27} className="h-7 w-auto" aria-hidden />
        </span>
        <span className="font-display font-semibold">Klinik Cahaya Medika</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[44px] rounded-xl border border-latar/30 px-4 text-sm"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
