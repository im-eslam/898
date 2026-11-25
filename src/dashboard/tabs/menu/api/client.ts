import type { ApiErrorBody, ErrorCode } from "@api/contracts";
import { ERROR_STATUS } from "@api/contracts";
import { ApiError, TIMEOUT_MS, type ErrorKey } from "@/shared/api/data";

const KNOWN_CODES: ReadonlySet<string> = new Set(Object.keys(ERROR_STATUS));

function isKnownCode(code: unknown): code is ErrorCode {
  return typeof code === "string" && KNOWN_CODES.has(code);
}

async function toBackendError(response: Response): Promise<ApiError> {
  const body = (await response
    .json()
    .catch(() => ({}))) as Partial<ApiErrorBody> | null;
  const code: ErrorKey = isKnownCode(body?.code) ? body.code : "UNKNOWN";
  const message =
    typeof body?.error === "string" ? body.error : response.statusText;
  return new ApiError(response.status, code, message);
}

function toFetchError(error: unknown): ApiError {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ApiError(0, "TIMEOUT", "Request timed out");
  }
  if (error instanceof TypeError) {
    return new ApiError(0, "NETWORK", "Network error");
  }
  return new ApiError(0, "UNKNOWN", "Unknown error");
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "include",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw toFetchError(error);
  }

  if (!response.ok) throw await toBackendError(response);

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(
      response.status,
      "UNKNOWN",
      "Invalid response from server"
    );
  }
}

export function getJson<T>(path: string): Promise<T> {
  return send<T>(path, { method: "GET" });
}

export function sendJson<T>(
  method: "POST" | "PUT",
  path: string,
  body: unknown
): Promise<T> {
  return send<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function deleteJson<T>(path: string): Promise<T> {
  return send<T>(path, { method: "DELETE" });
}

export function sendForm<T>(
  method: "POST" | "PUT",
  path: string,
  form: FormData
): Promise<T> {
  return send<T>(path, { method, body: form });
}
