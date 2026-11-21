export const API_BASE = "/api";
export const TIMEOUT_MS = 25_000;
export const UNKNOWN_CODE = "UNKNOWN";

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
