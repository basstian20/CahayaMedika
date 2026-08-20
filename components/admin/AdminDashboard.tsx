"use client";

import Link from "next/link";
import { CalendarClock, ClipboardList, History, UserRound } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { IndikatorCahaya } from "@/components/public/IndikatorCahaya";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { useKlinikStatus } from "@/lib/public/useKlinikStatus";
import { useRiwayat } from "@/lib/modules/riwayat/useRiwayat";

interface AdminDashboardProps {
  jadwalMingguIni: { hari: string; jam_mulai: string; jam_selesai: string }[];
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string };
}

const NAV_CARDS = [
  { href: "/admin/jadwal", label: "Edit Jadwal Dokter", icon: CalendarClock, wide: false },
  { href: "/admin/layanan", label: "Edit Info Layanan", icon: ClipboardList, wide: false },
  { href: "/admin/dokter", label: "Edit Profil Dokter", icon: UserRound, wide: false },
  { href: "/admin/riwayat", label: "Lihat Riwayat Perubahan", icon: History, wide: true },
] as const;

// Guard komponen-level (redundant dengan middleware.ts, dipertahankan sebagai
// fallback UX) — CLAUDE.md §2.1: guard frontend adalah UX, bukan keamanan.
export function AdminDashboard({ jadwalMingguIni, jamOperasionalDefault }: AdminDashboardProps) {
  const { status } = useAdminSession();
  const { data, status: riwayatStatus } = useRiwayat({ page: 1, limit: 1 });
  const { status: klinikStatus } = useKlinikStatus(jadwalMingguIni, jamOperasionalDefault);

  if (status === "loading") return <DashboardSkeleton />;
  if (status === "unauthenticated") return null;

  return (
    <main className="min-h-screen bg-latar font-body">
      <AdminHeader />

      <section className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-nakhoda px-6 pb-4 text-sm">
        <IndikatorCahaya status={klinikStatus} onDark />
        <span className="text-latar/70">
          {riwayatStatus === "loading" && "Memuat ringkasan..."}
          {riwayatStatus === "success" && data && data.data.length > 0 && (
            <>
              Terakhir diubah: {new Date(data.data[0].created_at).toLocaleString("id-ID")} oleh{" "}
              {data.data[0].admin_email}
            </>
          )}
          {riwayatStatus === "success" && data && data.data.length === 0 && "Belum ada perubahan tercatat."}
        </span>
      </section>

      <nav className="grid gap-4 px-6 py-6 md:grid-cols-2">
        {NAV_CARDS.map(({ href, label, icon: Icon, wide }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 rounded-xl border border-transparent bg-white p-6 shadow-card hover:border-cahaya ${
              wide ? "md:col-span-2" : ""
            }`}
          >
            <Icon className="h-8 w-8 shrink-0 text-cahaya" aria-hidden />
            <span className="font-display text-lg font-semibold text-nakhoda">{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="min-h-screen bg-latar p-6 text-nakhoda">
      Memuat...
    </div>
  );
}
