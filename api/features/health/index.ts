import { Hono } from "hono";
import { AppError } from "../../contracts.js";
import type { HealthResponse } from "./contract.js";
import { healthService } from "./service.js";

const routes = new Hono();

routes.get("/health", async (c) => {
  if (!(await healthService.checkDatabase())) throw new AppError("UNAVAILABLE");
  return c.json({ ok: true, database: "up" } satisfies HealthResponse);
});

export const healthApi = { routes } as const;
