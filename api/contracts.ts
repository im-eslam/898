import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AdminRoutes } from "./features/admin/contract.js";
import type { HealthRoutes } from "./features/health/contract.js";
import type { MenuAdminRoutes, MenuRoutes } from "./features/menu/contract.js";
import type { ReviewsRoutes } from "./features/reviews/contract.js";
import { ADMIN_ERRORS } from "./features/admin/contract.js";
import { MENU_ERRORS } from "./features/menu/contract.js";

export * from "./features/admin/contract.js";
export type * from "./features/menu/contract.js";
export type * from "./features/reviews/contract.js";

const BASE_ERRORS = {
  INTERNAL_ERROR: 500,
  HTTP_ERROR: 500,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  INVALID_INPUT: 422,
  UNAUTHORIZED: 401,
  UNAVAILABLE: 503,
} as const satisfies Record<string, ContentfulStatusCode>;

export const ERROR_STATUS = {
  ...BASE_ERRORS,
  ...ADMIN_ERRORS,
  ...MENU_ERRORS,
} satisfies Record<string, ContentfulStatusCode>;

export type ErrorCode = keyof typeof ERROR_STATUS;

export type ApiErrorBody = { ok: false; error: string; code: ErrorCode };

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: ContentfulStatusCode;

  constructor(
    code: ErrorCode,
    message: string = String(code),
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

type RouteContract = {
  body?: unknown;
  query?: unknown;
  response: unknown;
  errors: ErrorCode;
};

type RouteMap<T extends Record<string, RouteContract>> = T;

export type ApiRouteMap = RouteMap<
  HealthRoutes & AdminRoutes & ReviewsRoutes & MenuRoutes & MenuAdminRoutes
>;

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
export type ApiErrorCode<R extends ApiRoute> =
  "INTERNAL_ERROR" | "HTTP_ERROR" | ApiRouteMap[R]["errors"];
