import type { Ok } from "../../contracts.js";

export type AdminDto = { id: number; username: string; language: string };

export type LoginRequest = { username: string; password: string };

export type LoginResponse = { ok: true; user: AdminDto };
export type MeResponse = LoginResponse;

export type AdminRoutes = {
  "POST /api/admin/login": { body: LoginRequest; response: LoginResponse };
  "POST /api/admin/logout": { response: Ok };
  "GET /api/admin/me": { response: MeResponse };
};
