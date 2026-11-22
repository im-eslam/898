import type { ApiBody } from "@api/contracts";
import { api } from "@/shared/api";

export type ReviewPayload = ApiBody<"POST /api/review">;

export function submitReview(payload: ReviewPayload) {
  return api("POST /api/review", { body: payload });
}
