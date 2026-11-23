import type { Ok } from "../../contracts.js";

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
  page?: number;
  per_page?: number;
};
export type DeleteReviewsRequest = { ids: number[] };

export type ReviewListResponse = ReviewPageDto & { ok: true };
export type DeleteReviewsResponse = { ok: true; deleted: number };

export type ReviewsRoutes = {
  "POST /api/review": { body: CreateReviewRequest; response: Ok };
  "GET /api/admin/reviews": {
    query: ReviewListQuery;
    response: ReviewListResponse;
  };
  "POST /api/admin/reviews/delete": {
    body: DeleteReviewsRequest;
    response: DeleteReviewsResponse;
  };
};
