import type { ApiBody } from "@api/contracts";
import { api } from "@/shared/api";

export type UpdateAdminPayload = ApiBody<"PATCH /api/admin/me">;

export function requestUpdateAdmin(payload: UpdateAdminPayload) {
  return api("PATCH /api/admin/me", { body: payload });
}
