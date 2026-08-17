"use client";

import { useEffect, useState } from "react";
import { fetchRiwayatRequest } from "./riwayat.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { RiwayatResponse } from "./riwayat.types";

type QueryStatus = "loading" | "success" | "error";

interface UseRiwayatOptions {
  page: number;
  limit: number;
}

// Dipakai baik oleh S9 (page berganti via "Muat lebih banyak") maupun
// ringkasan S6 (limit: 1, page: 1). Tidak ada cache lintas pemanggilan.
export function useRiwayat({ page, limit }: UseRiwayatOptions) {
  const [status, setStatus] = useState<QueryStatus>("loading");
  const [data, setData] = useState<RiwayatResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchRiwayatRequest(page, limit)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            err instanceof ApiClientError ? err.message : "Gagal memuat riwayat perubahan."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  return { data, status, errorMessage };
}
