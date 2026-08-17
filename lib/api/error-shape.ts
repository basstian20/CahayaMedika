// Sesuai TSD §4.3: semua endpoint admin pakai envelope
// { success, ... } / { success: false, error, message }
// (lib/shared/response.ts — handleRoute()).
export interface ApiErrorBody {
  success: false;
  error: "UNAUTHORIZED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";
  message: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  [key: string]: unknown | T;
}

export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorBody["error"],
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
