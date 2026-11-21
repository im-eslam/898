import type { ApiBody, Ok } from "@api/contracts";
import { api } from "@/shared/api";

export type ReviewPayload = ApiBody<"POST /api/review">;

export function submitReview(payload: ReviewPayload) {
  return api.post<Ok>("/review", payload);
}
