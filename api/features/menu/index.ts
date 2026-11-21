import { Hono } from "hono";
import type { MenuResponse } from "./contract.js";
import { menuService } from "./service.js";

export type * from "./contract.js";

const MENU_CACHE_CONTROL = "public, max-age=60";

const routes = new Hono();

routes.get("/menu", async (c) => {
  const menu = await menuService.getMenu();

  c.header("Cache-Control", MENU_CACHE_CONTROL);
  return c.json({ ok: true, ...menu } satisfies MenuResponse);
});

export const menuApi = { routes } as const;
