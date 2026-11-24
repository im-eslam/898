import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Ok } from "../../contracts.js";

export const ADMIN_LANGUAGES = ["en", "ar"] as const;
export type AdminLanguage = (typeof ADMIN_LANGUAGES)[number];

export type AdminDto = {
  id: number;
  username: string;
  language: AdminLanguage;
};

export type LoginRequest = { username: string; password: string };
export type UpdateAccountRequest = {
  currentPassword?: string;
  username?: string;
  newPassword?: string;
  language?: AdminLanguage;
};

export type LoginResponse = { ok: true; user: AdminDto };
export type MeResponse = LoginResponse;

export const ADMIN_ERRORS = {
  INVALID_CREDENTIALS: 401,
  WRONG_CURRENT_PASSWORD: 403,
  CURRENT_PASSWORD_REQUIRED: 422,
  USERNAME_INVALID: 422,
  USERNAME_TAKEN: 409,
  PASSWORD_TOO_SHORT: 422,
  PASSWORD_TOO_LONG: 422,
  PASSWORD_SAME_AS_USERNAME: 422,
  NOTHING_TO_UPDATE: 422,
} as const satisfies Record<string, ContentfulStatusCode>;

export type AdminRoutes = {
  "POST /api/admin/login": {
    body: LoginRequest;
    response: LoginResponse;
    errors: "INVALID_CREDENTIALS" | "PAYLOAD_TOO_LARGE";
  };
  "POST /api/admin/logout": {
    response: Ok;
    errors: "UNAUTHORIZED" | "PAYLOAD_TOO_LARGE";
  };
  "GET /api/admin/me": {
    response: MeResponse;
    errors: "UNAUTHORIZED";
  };
  "PATCH /api/admin/me": {
    body: UpdateAccountRequest;
    response: MeResponse;
    errors:
      | "UNAUTHORIZED"
      | "PAYLOAD_TOO_LARGE"
      | "INVALID_INPUT"
      | "NOTHING_TO_UPDATE"
      | "CURRENT_PASSWORD_REQUIRED"
      | "WRONG_CURRENT_PASSWORD"
      | "USERNAME_INVALID"
      | "USERNAME_TAKEN"
      | "PASSWORD_TOO_SHORT"
      | "PASSWORD_TOO_LONG"
      | "PASSWORD_SAME_AS_USERNAME";
  };
};
