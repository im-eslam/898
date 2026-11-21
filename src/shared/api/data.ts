export const API_BASE = "/api";
export const TIMEOUT_MS = 25_000;
export const UNKNOWN_CODE = "UNKNOWN";

export const ERROR_STATUS = {
  INVALID_INPUT: 422,
  INVALID_CREDENTIALS: 401,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  HTTP_ERROR: 500,
  INTERNAL_ERROR: 500,
} as const;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ErrorCode = keyof typeof ERROR_STATUS;

export type ErrorKey = ErrorCode | "TIMEOUT" | "NETWORK" | "UNKNOWN";
