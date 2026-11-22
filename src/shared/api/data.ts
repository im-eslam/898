export const TIMEOUT_MS = 25_000;

export const BACKEND_ERROR_CODES = [
  "INVALID_INPUT",
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
  "NOT_FOUND",
  "PAYLOAD_TOO_LARGE",
  "RATE_LIMITED",
  "HTTP_ERROR",
  "INTERNAL_ERROR",
] as const;
export type BackendErrorCodes = (typeof BACKEND_ERROR_CODES)[number];

export type ErrorKey = BackendErrorCodes | "TIMEOUT" | "NETWORK" | "UNKNOWN";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorKey;

  constructor(status: number, code: ErrorKey, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}
