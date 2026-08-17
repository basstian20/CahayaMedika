"use client";

import { useState } from "react";
import { updateLayananRequest } from "./layanan.api";
import { ApiClientError } from "@/lib/api/error-shape";
import type { UpdateLayananInput, UpdateLayananResponse } from "./layanan.types";

type MutationStatus = "idle" | "saving" | "success" | "error";

export function useUpdateLayanan() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<UpdateLayananResponse | null>(null);

  async function save(input: UpdateLayananInput) {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const result = await updateLayananRequest(input);
      setData(result);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiClientError ? err.message : "Gagal menyimpan layanan. Coba lagi."
      );
    }
  }

  return { save, status, errorMessage, data };
}
