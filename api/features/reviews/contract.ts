import type { Ok } from "../../base/errors.js";

export type ReviewDto = {
  id: number;
  name: string;
  contact: string;
  message: string;
  created_at: string;
};
export type ReviewPageDto = {
  items: ReviewDto[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type CreateReviewRequest = {
  message: string;
  name?: string;
  contact?: string;
  website?: string;
};
export type ReviewListQuery = {
  q?: string;
  page?: string;
  per_page?: string;
};
export type DeleteReviewsRequest = {
  ids: number[];
};

export type CreateReviewResponse = Ok;
export type ReviewListResponse = { ok: true } & ReviewPageDto;
export type DeleteReviewsResponse = { ok: true; deleted: number };

export type ReviewsApiContract = {
  "POST /api/review": {
    body: CreateReviewRequest;
    response: CreateReviewResponse;
    errors:
      | "INVALID_INPUT"
      | "PAYLOAD_TOO_LARGE"
      | "HTTP_ERROR"
      | "INTERNAL_ERROR";
  };
  "GET /api/admin/reviews": {
    query: ReviewListQuery;
    response: ReviewListResponse;
    errors: "UNAUTHORIZED" | "INVALID_INPUT" | "INTERNAL_ERROR";
  };
  "POST /api/admin/reviews/delete": {
    body: DeleteReviewsRequest;
    response: DeleteReviewsResponse;
    errors:
      | "UNAUTHORIZED"
      | "INVALID_INPUT"
      | "PAYLOAD_TOO_LARGE"
      | "HTTP_ERROR"
      | "INTERNAL_ERROR";
  };
};
