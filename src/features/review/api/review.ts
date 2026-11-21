import type { ApiBody, Ok } from "@api/contracts";
import { Api } from "@/shared/api";

export type ReviewPayload = ApiBody<"POST /api/review">;

export function submitReview(payload: ReviewPayload) {
  return Api.post<Ok>("/review", payload);
}
