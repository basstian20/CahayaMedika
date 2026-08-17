"use client";

import { useState } from "react";
import { updateDokterRequest } from "./dokter.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { UpdateDokterInput, UpdateDokterResponse } from "./dokter.types";

type MutationStatus = "idle" | "saving" | "success" | "error" | "not_found";

export function useUpdateDokter() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<UpdateDokterResponse | null>(null);

  async function save(input: UpdateDokterInput) {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const result = await updateDokterRequest(input);
      setData(result);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
        setStatus("not_found");
        setErrorMessage(err.message);
        return;
      }
      setStatus("error");
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal menyimpan profil dokter. Coba lagi."
      );
    }
  }

  return { save, status, errorMessage, data };
}
