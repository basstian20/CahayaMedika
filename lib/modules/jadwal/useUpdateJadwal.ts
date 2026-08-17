"use client";

import { useState } from "react";
import { updateJadwalRequest } from "./jadwal.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { UpdateJadwalInput, UpdateJadwalResponse } from "./jadwal.types";

type MutationStatus = "idle" | "saving" | "success" | "error";

// Tidak ada cache lintas komponen untuk di-invalidate (CLAUDE.md §2.1 §0.3
// Frontend Logic) — cukup local state.
export function useUpdateJadwal() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<UpdateJadwalResponse | null>(null);

  async function save(input: UpdateJadwalInput) {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const result = await updateJadwalRequest(input);
      setData(result);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal menyimpan jadwal. Coba lagi."
      );
    }
  }

  return { save, status, errorMessage, data };
}
