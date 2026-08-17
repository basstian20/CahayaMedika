"use client";

import { useState } from "react";
import { uploadFotoDokterRequest } from "@/lib/modules/dokter/dokter-foto.api";
import { ApiClientError } from "@/lib/api/error-shape";
import { MAX_FOTO_SIZE_BYTES, ALLOWED_FOTO_MIME } from "@/lib/modules/dokter/dokter.schema";

type UploadStatus = "idle" | "uploading" | "success" | "error";

// Validasi pre-flight di client — feedback instan, TIDAK menggantikan
// validasi server (dokter-foto.service.ts) yang tetap jadi enforcement asli.
export function useUploadFotoDokter() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  function validateClientSide(file: File): string | null {
    if (!ALLOWED_FOTO_MIME.includes(file.type as (typeof ALLOWED_FOTO_MIME)[number])) {
      return `Tipe file ${file.type} tidak didukung. Gunakan JPEG, PNG, atau WebP.`;
    }
    if (file.size > MAX_FOTO_SIZE_BYTES) {
      return `Ukuran file melebihi batas ${MAX_FOTO_SIZE_BYTES / 1024 / 1024}MB.`;
    }
    return null;
  }

  async function upload(dokterId: string, file: File) {
    const clientError = validateClientSide(file);
    if (clientError) {
      setStatus("error");
      setErrorMessage(clientError);
      return;
    }

    setStatus("uploading");
    setErrorMessage(null);
    try {
      const result = await uploadFotoDokterRequest(dokterId, file);
      setFotoUrl(result.foto_url);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof ApiClientError ? err.message : "Gagal upload foto. Coba lagi.");
    }
  }

  return { upload, status, errorMessage, fotoUrl };
}
