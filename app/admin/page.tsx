"use client";

import Image from "next/image";
import Link from "next/link";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRiwayat } from "@/lib/modules/riwayat/useRiwayat";

// Guard komponen-level (redundant dengan middleware.ts, dipertahankan sebagai
// fallback UX) — CLAUDE.md §2.1: guard frontend adalah UX, bukan keamanan.
export default function AdminDashboardPage() {
  const { status } = useAdminSession();
  const { data, status: riwayatStatus } = useRiwayat({ page: 1, limit: 1 });

  if (status === "loading") return <DashboardSkeleton />;
  if (status === "unauthenticated") return null;

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-latar font-body">
      <header className="flex items-center justify-between bg-nakhoda px-6 py-4 text-latar">
        <div className="flex items-center gap-2.5">
          {/* Chip terang di belakang logo — bagian navy mark nyaris tak
              kontras di atas nakhoda gelap (~1.8:1) tanpa backdrop ini. */}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-latar p-1">
            <Image src="/images/logo.png" alt="" width={28} height={27} className="h-7 w-auto" aria-hidden />
          </span>
          <span className="font-display font-semibold">Klinik Cahaya Medika</span>
        </div>
        <button onClick={handleLogout} className="min-h-[44px] rounded-xl border border-latar/30 px-4 text-sm">
          Keluar
        </button>
      </header>

      <section className="px-6 py-4 text-sm text-nakhoda/70">
        {riwayatStatus === "loading" && <p>Memuat ringkasan...</p>}
        {riwayatStatus === "success" && data && data.data.length > 0 && (
          <p>
            Terakhir diubah: {new Date(data.data[0].created_at).toLocaleString("id-ID")} oleh{" "}
            {data.data[0].admin_email}
          </p>
        )}
        {riwayatStatus === "success" && data && data.data.length === 0 && (
          <p>Belum ada perubahan tercatat.</p>
        )}
      </section>

      <nav className="grid gap-4 px-6 pb-10 md:grid-cols-2">
        <Link
          href="/admin/jadwal"
          className="rounded-xl border border-transparent bg-white p-6 shadow-card hover:border-cahaya"
        >
          <span className="block font-display text-lg font-semibold text-nakhoda">Edit Jadwal Dokter</span>
        </Link>
        <Link
          href="/admin/layanan"
          className="rounded-xl border border-transparent bg-white p-6 shadow-card hover:border-cahaya"
        >
          <span className="block font-display text-lg font-semibold text-nakhoda">Edit Info Layanan</span>
        </Link>
        <Link
          href="/admin/dokter"
          className="rounded-xl border border-transparent bg-white p-6 shadow-card hover:border-cahaya"
        >
          <span className="block font-display text-lg font-semibold text-nakhoda">Edit Profil Dokter</span>
        </Link>
        <Link
          href="/admin/riwayat"
          className="rounded-xl border border-transparent bg-white p-6 shadow-card hover:border-cahaya md:col-span-2"
        >
          <span className="block font-display text-lg font-semibold text-nakhoda">Lihat Riwayat Perubahan</span>
        </Link>
      </nav>
    </main>
  );
}

function DashboardSkeleton() {
  return <div aria-busy="true" className="min-h-screen bg-latar p-6 text-nakhoda">Memuat...</div>;
}
