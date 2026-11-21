import type { AdminApiContract } from "./features/admin/contract.js";
import type { HealthApiContract } from "./features/health/contract.js";
import type { MenuApiContract } from "./features/menu/contract.js";
import type { ReviewsApiContract } from "./features/reviews/contract.js";

export { ERROR_STATUS } from "./base/errors.js";
export type { ApiErrorBody, ErrorCode, Ok } from "./base/errors.js";
export type * from "./features/admin/contract.js";
export type * from "./features/health/contract.js";
export type * from "./features/menu/contract.js";
export type * from "./features/reviews/contract.js";

export type ApiRouteMap = HealthApiContract &
  AdminApiContract &
  ReviewsApiContract &
  MenuApiContract;

export type ApiRoute = keyof ApiRouteMap;
export type ApiBody<R extends ApiRoute> = ApiRouteMap[R] extends {
  body: infer Body;
}
  ? Body
  : never;
export type ApiQuery<R extends ApiRoute> = ApiRouteMap[R] extends {
  query: infer Query;
}
  ? Query
  : never;
export type ApiResponse<R extends ApiRoute> = ApiRouteMap[R]["response"];
export type ApiErrorCode<R extends ApiRoute> = ApiRouteMap[R]["errors"];
