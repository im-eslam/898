import type { ApiBody } from "@api/contracts";
import { ApiError, postJson } from "@/shared/api";

export type ReviewPayload = ApiBody<"POST /api/review">;

export type ReviewError =
  "unknown" | "invalid-input" | "timeout" | "server" | "rate-limited";

export function submitReview(payload: ReviewPayload) {
  return postJson<unknown>("/review", payload);
}

export function getReviewError(err: unknown): ReviewError {
  if (err instanceof ApiError) {
    if (err.status >= 500) return "server";
    if (err.code === "RATE_LIMITED") return "rate-limited";
    if (err.code === "INVALID_INPUT" || err.code === "PAYLOAD_TOO_LARGE") {
      return "invalid-input";
    }
    return "unknown";
  }
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return "timeout";
  }
  return "unknown";
}
