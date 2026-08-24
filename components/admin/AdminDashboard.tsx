"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, ClipboardList, History, UserRound } from "lucide-react";
import { IndikatorCahaya } from "@/components/public/IndikatorCahaya";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { useKlinikStatus } from "@/lib/public/useKlinikStatus";
import { useRiwayat } from "@/lib/modules/riwayat/useRiwayat";
import type { RiwayatEntry } from "@/lib/modules/riwayat/riwayat.types";

interface DashboardDokter {
  id: string;
  nama: string;
  foto_url: string | null;
}

interface DashboardLayanan {
  id: string;
  nama: string;
  tampil_di_homepage: boolean;
}

interface AdminDashboardProps {
  jadwalMingguIni: { hari: string; jam_mulai: string; jam_selesai: string }[];
  jamOperasionalDefault?: { jam_mulai: string; jam_selesai: string };
  layanan: DashboardLayanan[];
  dokter: DashboardDokter[];
}

function terakhirDiubah(entries: RiwayatEntry[], jenis: string): string | null {
  const entry = entries.find((e) => e.jenis_perubahan === jenis);
  if (!entry) return null;
  return new Date(entry.created_at).toLocaleString("id-ID");
}

// Guard komponen-level (redundant dengan middleware.ts, dipertahankan sebagai
// fallback UX) — CLAUDE.md §2.1: guard frontend adalah UX, bukan keamanan.
export function AdminDashboard({
  jadwalMingguIni,
  jamOperasionalDefault,
  layanan,
  dokter,
}: AdminDashboardProps) {
  const { status } = useAdminSession();
  const { data, status: riwayatStatus } = useRiwayat({ page: 1, limit: 5 });
  const { status: klinikStatus } = useKlinikStatus(jadwalMingguIni, jamOperasionalDefault);

  if (status === "loading") return <DashboardSkeleton />;
  if (status === "unauthenticated") return null;

  const entries = riwayatStatus === "success" && data ? data.data : [];
  const layananAktif = layanan.filter((l) => l.tampil_di_homepage).length;

  return (
    <div className="min-h-full bg-latar font-body">
      <section className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-nakhoda/10 px-6 py-4 text-sm">
        <IndikatorCahaya status={klinikStatus} />
      </section>

      <div className="grid gap-4 px-6 py-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <RingkasanCard
            href="/admin/jadwal"
            icon={CalendarClock}
            label="Edit Jadwal Dokter"
            subtitle={`Kelola jadwal untuk ${dokter.length} dokter`}
            terakhir={terakhirDiubah(entries, "jadwal")}
          />
          <RingkasanCard
            href="/admin/layanan"
            icon={ClipboardList}
            label="Edit Info Layanan"
            subtitle={`${layananAktif} dari ${layanan.length} layanan aktif`}
            terakhir={terakhirDiubah(entries, "layanan")}
          />
          <RingkasanCard
            href="/admin/dokter"
            icon={UserRound}
            label="Edit Profil Dokter"
            subtitle={`${dokter.length} dokter terdaftar`}
            terakhir={terakhirDiubah(entries, "dokter")}
          >
            {dokter.length > 0 && (
              <div className="mt-3 flex -space-x-2">
                {dokter.slice(0, 5).map((d) => (
                  <span
                    key={d.id}
                    className="h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-white bg-nakhoda/10"
                  >
                    {d.foto_url ? (
                      <Image src={d.foto_url} alt="" width={32} height={32} className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                ))}
              </div>
            )}
          </RingkasanCard>
          <RingkasanCard
            href="/admin/riwayat"
            icon={History}
            label="Lihat Riwayat Perubahan"
            subtitle="Log perubahan lengkap"
          />
        </div>

        <section aria-labelledby="aktivitas-terakhir" className="rounded-xl bg-white p-5 shadow-card">
          <h2 id="aktivitas-terakhir" className="font-display text-sm font-semibold text-nakhoda">
            Aktivitas Terakhir
          </h2>
          <div className="mt-3 space-y-3">
            {riwayatStatus === "loading" && <p className="text-sm text-nakhoda/50">Memuat...</p>}
            {riwayatStatus === "success" && entries.length === 0 && (
              <p className="text-sm text-nakhoda/50">Belum ada perubahan tercatat.</p>
            )}
            {entries.map((entry) => (
              <div key={entry.id} className="border-b border-nakhoda/5 pb-3 text-sm last:border-0 last:pb-0">
                <p className="font-mono text-xs tabular-nums text-nakhoda/50">
                  {new Date(entry.created_at).toLocaleString("id-ID")}
                </p>
                <p className="text-nakhoda">{entry.ringkasan}</p>
                <p className="text-xs text-nakhoda/50">oleh {entry.admin_email}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface RingkasanCardProps {
  href: string;
  icon: typeof CalendarClock;
  label: string;
  subtitle: string;
  terakhir?: string | null;
  children?: ReactNode;
}

function RingkasanCard({ href, icon: Icon, label, subtitle, terakhir, children }: RingkasanCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-xl border border-transparent bg-white p-6 shadow-card transition hover:border-cahaya focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cahaya focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-4">
        <Icon className="h-8 w-8 shrink-0 text-cahaya" aria-hidden />
        <span className="font-display text-lg font-semibold text-nakhoda">{label}</span>
      </div>
      <p className="mt-2 text-sm text-nakhoda/60">{subtitle}</p>
      {children}
      {terakhir && <p className="mt-2 text-xs text-nakhoda/40">Terakhir diubah: {terakhir}</p>}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="min-h-full bg-latar p-6 text-nakhoda">
      Memuat...
    </div>
  );
}
