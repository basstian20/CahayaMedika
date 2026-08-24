"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, ClipboardList, History, LayoutGrid, UserRound } from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/jadwal", label: "Edit Jadwal Dokter", icon: CalendarClock },
  { href: "/admin/layanan", label: "Edit Info Layanan", icon: ClipboardList },
  { href: "/admin/dokter", label: "Edit Profil Dokter", icon: UserRound },
  { href: "/admin/riwayat", label: "Lihat Riwayat Perubahan", icon: History },
] as const;

// Navigasi persisten lintas S6-S9 — menggantikan pola hub-only (balik ke
// dashboard tiap pindah modul). Rail vertikal di >=md, strip tab horizontal
// di mobile (bukan hamburger drawer, supaya tidak nambah state disclosure
// baru — konsisten prinsip "tanpa training >15 menit").
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi panel admin"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-nakhoda/10 bg-white px-2 py-2 md:w-60 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:px-3 md:py-6"
    >
      {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[44px] shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              isActive ? "bg-cahaya/10 text-cahaya" : "text-nakhoda/70 hover:bg-latar hover:text-nakhoda"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
