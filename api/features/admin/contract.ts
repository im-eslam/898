import type { Ok } from "../../base/errors.js";

export type AdminProfile = {
  username: string;
  language: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  ok: true;
  user: AdminProfile;
};
export type MeResponse = LoginResponse;

export type AdminApiContract = {
  "POST /api/admin/login": {
    body: LoginRequest;
    response: LoginResponse;
    errors:
      | "INVALID_CREDENTIALS"
      | "RATE_LIMITED"
      | "PAYLOAD_TOO_LARGE"
      | "HTTP_ERROR"
      | "INTERNAL_ERROR";
  };
  "POST /api/admin/logout": {
    response: Ok;
    errors: "UNAUTHORIZED" | "INTERNAL_ERROR";
  };
  "GET /api/admin/me": {
    response: MeResponse;
    errors: "UNAUTHORIZED" | "INTERNAL_ERROR";
  };
};
