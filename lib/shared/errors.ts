// Kelas error terstandar — dipetakan ke HTTP status code lewat helper di response.ts,
// bukan if/else manual di tiap Route Handler (Backend Blueprint §7)

export class UnauthorizedError extends Error {
  readonly status = 401;
  readonly code = "UNAUTHORIZED";
  constructor(message = "Sesi admin tidak valid, silakan login ulang.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends Error {
  readonly status = 400;
  readonly code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404;
  readonly code = "NOT_FOUND";
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InternalError extends Error {
  readonly status = 500;
  readonly code = "INTERNAL_ERROR";
  constructor(message = "Terjadi kesalahan pada server.") {
    super(message);
    this.name = "InternalError";
  }
}

export type KnownError = UnauthorizedError | ValidationError | NotFoundError | InternalError;
