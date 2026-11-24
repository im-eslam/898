import type { ApiBody, ApiQuery, ApiResponse } from "@api/contracts";
import { api } from "@/shared/api";

export type ReviewListParams = ApiQuery<"GET /api/admin/reviews">;
export type ReviewListResponse = ApiResponse<"GET /api/admin/reviews">;
export type DeleteReviewsBody = ApiBody<"POST /api/admin/reviews/delete">;
export type DeleteReviewsResponse =
  ApiResponse<"POST /api/admin/reviews/delete">;

export function listReviews(params: ReviewListParams) {
  return api("GET /api/admin/reviews", { query: params });
}

export function deleteReviews(ids: number[]) {
  const body: DeleteReviewsBody = { ids };
  return api("POST /api/admin/reviews/delete", { body });
}
