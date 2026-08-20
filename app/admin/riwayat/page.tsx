"use client";

import { useEffect, useState } from "react";
import { useRiwayat } from "@/lib/modules/riwayat/useRiwayat";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { RiwayatEntry } from "@/lib/modules/riwayat/riwayat.types";

const LIMIT = 20;

export default function RiwayatPage() {
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<RiwayatEntry[]>([]);
  const { data, status, errorMessage } = useRiwayat({ page, limit: LIMIT });

  useEffect(() => {
    if (status === "success" && data && page === 1) {
      setEntries(data.data);
    }
  }, [status, data, page]);

  function loadMore() {
    if (!data) return;
    setEntries((prev) => [...prev, ...data.data]);
    setPage((p) => p + 1);
  }

  return (
    <main className="min-h-screen bg-latar font-body">
      <AdminHeader backHref="/admin" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-semibold text-nakhoda">
          Riwayat Perubahan
        </h1>

        {status === "loading" && page === 1 && <p aria-busy="true">Memuat...</p>}
        {status === "error" && (
          <p role="alert" className="text-error">
            {errorMessage}
          </p>
        )}
        {status === "success" && entries.length === 0 && (
          <p className="text-nakhoda/60">Belum ada perubahan tercatat.</p>
        )}

        {entries.length > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-nakhoda/10 font-mono text-xs uppercase text-nakhoda/60">
                  <th className="p-4">Tanggal/Jam</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Jenis</th>
                  <th className="p-4">Ringkasan</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-nakhoda/5 last:border-0">
                    <td className="p-4 font-mono tabular-nums text-nakhoda/80">
                      {new Date(entry.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-nakhoda">{entry.admin_email}</td>
                    <td className="p-4 text-nakhoda">{entry.jenis_perubahan}</td>
                    <td className="p-4 text-nakhoda">{entry.ringkasan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.has_more && (
          <button
            onClick={loadMore}
            disabled={status === "loading"}
            className="mt-4 min-h-[44px] w-full rounded-xl border border-nakhoda/20 px-4 text-sm font-medium text-nakhoda"
          >
            Muat lebih banyak
          </button>
        )}
      </div>
    </main>
  );
}
