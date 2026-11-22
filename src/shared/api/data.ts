import type { ErrorCode } from "@api/contracts";

export const TIMEOUT_MS = 25_000;

export type ErrorKey = ErrorCode | "TIMEOUT" | "NETWORK" | "UNKNOWN";

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
