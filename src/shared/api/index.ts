import { API_BASE, ApiError, TIMEOUT_MS, UNKNOWN_CODE } from "./data";

export { ApiError };

class Client {
  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data: unknown = await response.json().catch(() => null);
    if (response.ok) return data as T;

    const error = data as { code?: unknown; error?: unknown } | null;
    throw new ApiError(
      response.status,
      typeof error?.code === "string" ? error.code : UNKNOWN_CODE,
      typeof error?.error === "string" ? error.error : response.statusText
    );
  }
}

const client = new Client();

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return client.post<T>(path, body);
}
