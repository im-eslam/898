import type { ApiBody } from "@api/contracts";
import { api } from "@/shared/api";

export type AccountUpdate = ApiBody<"PATCH /api/admin/me">;

export function updateAccount(body: AccountUpdate) {
  return api("PATCH /api/admin/me", { body });
}
