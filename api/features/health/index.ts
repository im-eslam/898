import { Hono } from "hono";
import { AppError } from "../../contracts.js";
import type { HealthResponse } from "./contract.js";
import { healthService } from "./service.js";

const routes = new Hono();

routes.get("/health", async (c) => {
  if (await healthService.checkDatabase()) {
    return c.json({ ok: true, database: "up" } satisfies HealthResponse);
  }
  const error = new AppError("UNAVAILABLE", "Database unavailable");
  return c.json(error.toBody(), error.status);
});

export const healthApi = { routes } as const;
