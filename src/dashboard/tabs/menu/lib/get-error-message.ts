import { ApiError } from "@/shared/api";
import type { MenuErrorKey } from "../strings";

export function getErrorMessage(
  errors: Record<MenuErrorKey, string>,
  error: unknown
): string {
  const code = error instanceof ApiError ? error.code : undefined;
  return code && Object.hasOwn(errors, code)
    ? errors[code as MenuErrorKey]
    : errors.UNKNOWN;
}

// Returns undefined when there is no error, so forms can show it only when needed.
export function errorText(
  errors: Record<MenuErrorKey, string>,
  error: unknown
): string | undefined {
  return error == null ? undefined : getErrorMessage(errors, error);
}
