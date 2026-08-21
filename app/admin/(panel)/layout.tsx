import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Shell bersama S6-S9 — sebelumnya tiap halaman render AdminHeader sendiri
// dan navigasi cuma bisa lewat dashboard (hub-only). Sekarang header + sidebar
// persisten di seluruh route group ini; /admin/login sengaja di luar group,
// tidak dapat shell ini (belum ada session).
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-latar font-body">
      <AdminHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
