"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface AdminHeaderProps {
  /** Kalau diisi, tampilkan tombol kembali ke dashboard (S6) — dashboard sendiri tidak perlu ini. */
  backHref?: string;
}

// Header bersama S6-S9 (dashboard + halaman edit) — sebelumnya tiap halaman
// edit (jadwal/layanan/dokter/riwayat) tidak punya jalan balik selain tombol
// back browser. Tetap sidebar-free (UI Template Spec §6 — "sidebar-free
// tetap dipertahankan di admin karena hanya beberapa aksi").
export function AdminHeader({ backHref }: AdminHeaderProps) {
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
        {backHref && (
          <Link
            href={backHref}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-latar/30 px-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
        )}
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
