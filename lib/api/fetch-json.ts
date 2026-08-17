import { ApiClientError, type ApiErrorBody } from "./error-shape";

// Wrapper tipis di atas fetch — satu tempat untuk parse envelope sukses/error
// TSD §4.3, supaya tiap API client function tidak menulis ulang
// try/catch + response.json() + pengecekan `success` sendiri-sendiri.
export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || body?.success === false) {
    const errBody = body as ApiErrorBody | null;
    throw new ApiClientError(
      errBody?.error ?? "INTERNAL_ERROR",
      errBody?.message ?? "Terjadi kesalahan tak terduga.",
      res.status
    );
  }

  return body as T;
}

// Varian untuk multipart/form-data (POST /api/admin/dokter/foto) — tidak set
// Content-Type manual, browser yang set boundary.
export async function fetchFormData<T>(input: RequestInfo, formData: FormData): Promise<T> {
  const res = await fetch(input, { method: "POST", body: formData });
  const body = await res.json().catch(() => null);

  if (!res.ok || body?.success === false) {
    const errBody = body as ApiErrorBody | null;
    throw new ApiClientError(
      errBody?.error ?? "INTERNAL_ERROR",
      errBody?.message ?? "Terjadi kesalahan tak terduga.",
      res.status
    );
  }

  return body as T;
}
