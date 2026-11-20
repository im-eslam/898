import type { Ok } from "../../base/errors.js";

export type HealthApiContract = {
  "GET /api/health": { response: Ok; errors: "INTERNAL_ERROR" };
};
