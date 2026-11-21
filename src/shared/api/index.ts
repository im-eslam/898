import {
  API_BASE,
  ApiError,
  TIMEOUT_MS,
  UNKNOWN_CODE,
  type ErrorKey,
} from "./data";
import { ERROR_STATUS, type ErrorCode } from "@api/contracts";

export { ApiError, type ErrorKey };

type QueryParams = Record<string, string | number | boolean | undefined>;

class Client {
  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>("GET", this.withQuery(path, query));
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private withQuery(path: string, query?: QueryParams): string {
    if (!query) return path;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }

    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const hasBody = body !== undefined;

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: "include",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const error = data as { code?: unknown; error?: unknown } | null;

      throw new ApiError(
        response.status,
        typeof error?.code === "string" ? error.code : UNKNOWN_CODE,
        typeof error?.error === "string"
          ? error.error
          : response.statusText || "Request failed"
      );
    }

    if (response.status === 204) return undefined as T;

    const data: unknown = await response.json().catch(() => {
      throw new ApiError(
        response.status,
        UNKNOWN_CODE,
        "Invalid response from server"
      );
    });

    return data as T;
  }
}

const client = new Client();

export const api = {
  get: <T>(path: string, query?: QueryParams) => client.get<T>(path, query),
  post: <T>(path: string, body?: unknown) => client.post<T>(path, body),
} as const;

export function toErrorKey(error: unknown): ErrorKey {
  if (error instanceof ApiError) {
    if (Object.hasOwn(ERROR_STATUS, error.code)) return error.code as ErrorCode;
    return error.status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN";
  }
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "TIMEOUT";
  }
  if (error instanceof TypeError) {
    return "NETWORK";
  }
  return "UNKNOWN";
}
