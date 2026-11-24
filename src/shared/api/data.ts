import type { ApiErrorCode, ApiRoute, ErrorCode } from "@api/contracts";

export const TIMEOUT_MS = 25_000;

export type ClientErrorKey = "TIMEOUT" | "NETWORK" | "UNKNOWN";
export type ErrorKey = ErrorCode | ClientErrorKey;
export type ApiErrorKey<R extends ApiRoute> = ApiErrorCode<R> | ClientErrorKey;

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
