import { api } from "@/shared/api";

export function fetchMenu() {
  return api("GET /api/menu");
}
