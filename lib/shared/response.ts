import { NextResponse } from "next/server";
import type { KnownError } from "./errors";

// Shape konsisten dengan contoh TSD §4.3: { success, ... } / { success: false, error, message }

export function successResponse<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(err: unknown) {
  if (isKnownError(err)) {
    return NextResponse.json(
      { success: false, error: err.code, message: err.message },
      { status: err.status }
    );
  }
  // Error tak terduga — jangan bocorkan detail internal ke client
  console.error("[unhandled-route-error]", err);
  return NextResponse.json(
    { success: false, error: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

function isKnownError(err: unknown): err is KnownError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "code" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}

// Wrapper try-catch bersama — dipanggil tiap Route Handler agar pola
// "validate -> requireAdmin -> service -> response" konsisten (Blueprint §7)
export async function handleRoute<T extends Record<string, unknown>>(
  fn: () => Promise<{ data: T; status?: number }>
) {
  try {
    const { data, status } = await fn();
    return successResponse(data, status);
  } catch (err) {
    return errorResponse(err);
  }
}
