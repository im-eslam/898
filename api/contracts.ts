import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AdminRoutes } from "./features/admin/contract.js";
import type { HealthRoutes } from "./features/health/contract.js";
import type { MenuRoutes } from "./features/menu/contract.js";
import type { ReviewsRoutes } from "./features/reviews/contract.js";

export * from "./features/admin/contract.js";
export type * from "./features/menu/contract.js";
export type * from "./features/reviews/contract.js";

export const ERROR_STATUS = {
  INVALID_INPUT: 422,
  INVALID_CREDENTIALS: 401,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  USERNAME_TAKEN: 409,
  PAYLOAD_TOO_LARGE: 413,
  HTTP_ERROR: 500,
  INTERNAL_ERROR: 500,
  UNAVAILABLE: 503,
} satisfies Record<string, ContentfulStatusCode>;

export type ErrorCode = keyof typeof ERROR_STATUS;

export type ApiErrorBody = { ok: false; error: string; code: ErrorCode };

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: ContentfulStatusCode;

  constructor(
    code: ErrorCode,
    message: string,
    status: ContentfulStatusCode = ERROR_STATUS[code]
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }

  toBody(): ApiErrorBody {
    return { ok: false, error: this.message, code: this.code };
  }
}

export type Ok = { ok: true };

export type ApiRouteMap = HealthRoutes &
  AdminRoutes &
  ReviewsRoutes &
  MenuRoutes;

export type ApiRoute = keyof ApiRouteMap;
export type ApiResponse<R extends ApiRoute> = ApiRouteMap[R]["response"];
export type ApiBody<R extends ApiRoute> = ApiRouteMap[R] extends {
  body: infer B;
}
  ? B
  : never;
export type ApiQuery<R extends ApiRoute> = ApiRouteMap[R] extends {
  query: infer Q;
}
  ? Q
  : never;
