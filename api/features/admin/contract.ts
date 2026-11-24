import type { Ok } from "../../contracts.js";

export const ADMIN_LANGUAGES = ["en", "ar"] as const;
export type AdminLanguage = (typeof ADMIN_LANGUAGES)[number];

export const ADMIN_LIMITS = {
  username: { min: 3, max: 50, pattern: /^[a-zA-Z0-9._\-]{3,50}$/ },
  password: { min: 10, max: 72 },
} as const;

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

export type AdminRoutes = {
  "POST /api/admin/login": { body: LoginRequest; response: LoginResponse };
  "POST /api/admin/logout": { response: Ok };
  "GET /api/admin/me": { response: MeResponse };
  "PATCH /api/admin/me": { body: UpdateAccountRequest; response: MeResponse };
};
