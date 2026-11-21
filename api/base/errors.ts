import type { ContentfulStatusCode } from "hono/utils/http-status";

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

export type ErrorCode = keyof typeof ERROR_STATUS;
export type ApiErrorBody = { ok: false; error: string; code: ErrorCode };
export type Ok = { ok: true };

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: ContentfulStatusCode;
  readonly headers: Record<string, string>;

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      status?: ContentfulStatusCode;
      headers?: Record<string, string>;
    } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = options.status ?? ERROR_STATUS[code];
    this.headers = options.headers ?? {};
  }

  toBody(): ApiErrorBody {
    return { ok: false, error: this.message, code: this.code };
  }
}
