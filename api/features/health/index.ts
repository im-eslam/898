import { Hono } from "hono";
import type { Ok } from "../../base/errors.js";

export type * from "./contract.js";

const routes = new Hono();

routes.get("/health", (c) => c.json({ ok: true } satisfies Ok));

export const healthApi = { routes } as const;
