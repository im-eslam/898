import { ApiError } from "@/shared/api";
import type { ReviewErrorKey } from "../strings";

export function getErrorMessage(
  errors: Record<ReviewErrorKey, string>,
  error: unknown,
): string {
  const code = error instanceof ApiError ? error.code : undefined;
  return code && Object.hasOwn(errors, code)
    ? errors[code as ReviewErrorKey]
    : errors.UNKNOWN;
}
