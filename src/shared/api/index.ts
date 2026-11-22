import type {
  ApiBody,
  ApiErrorBody,
  ApiQuery,
  ApiResponse,
  ApiRoute,
} from "@api/contracts";
import {
  ApiError,
  BACKEND_ERROR_CODES,
  TIMEOUT_MS,
  type BackendErrorCodes,
  type ErrorKey,
} from "./data";

type Options<R extends ApiRoute> = {
  query?: ApiQuery<R>;
  body?: ApiBody<R>;
};

class Helpers {
  private static readonly backendErrorCodes: ReadonlySet<string> = new Set(
    BACKEND_ERROR_CODES
  );

  private static isBackendErrorCode(code: unknown): code is BackendErrorCodes {
    return typeof code === "string" && Helpers.backendErrorCodes.has(code);
  }

  static buildUrl(path: string, query: Record<string, unknown> = {}): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  static buildInit(method: string, body?: unknown): RequestInit {
    const hasBody = body !== undefined;
    return {
      method,
      credentials: "include",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    };
  }

  static async toBackendError(response: Response): Promise<ApiError> {
    const body = (await response
      .json()
      .catch(() => ({}))) as Partial<ApiErrorBody> | null;

    const rawCode = body?.code;
    const code: ErrorKey = Helpers.isBackendErrorCode(rawCode)
      ? rawCode
      : "UNKNOWN";

    const message =
      typeof body?.error === "string" ? body.error : response.statusText;

    return new ApiError(response.status, code, message);
  }

  static toFetchError(error: unknown): ApiError {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return new ApiError(0, "TIMEOUT", "Request timed out");
    }
    if (error instanceof TypeError) {
      return new ApiError(0, "NETWORK", "Network error");
    }
    return new ApiError(0, "UNKNOWN", "Unknown error");
  }
}

async function api<R extends ApiRoute>(
  route: R,
  options: Options<R> = {}
): Promise<ApiResponse<R>> {
  const [method, path] = route.split(" ") as [string, string];
  const url = Helpers.buildUrl(
    path,
    options.query as Record<string, unknown> | undefined
  );

  let response: Response;
  try {
    response = await fetch(url, Helpers.buildInit(method, options.body));
  } catch (error) {
    throw Helpers.toFetchError(error);
  }

  if (!response.ok) throw await Helpers.toBackendError(response);

  try {
    return (await response.json()) as ApiResponse<R>;
  } catch {
    throw new ApiError(
      response.status,
      "UNKNOWN",
      "Invalid response from server"
    );
  }
}

export { type ErrorKey, api };
