import type { ApiBody } from "@api/contracts";
import { api } from "@/shared/api";

export type SignInPayload = ApiBody<"POST /api/admin/login">;

export function requestSession() {
  return api("GET /api/admin/me");
}

export function requestSignIn(payload: SignInPayload) {
  return api("POST /api/admin/login", { body: payload });
}

export function requestSignOut() {
  return api("POST /api/admin/logout");
}
