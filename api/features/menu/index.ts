import { Hono } from "hono";
import { AppError, type MenuResponse } from "../../contracts.js";
import { MENU_CACHE_TTL_MS, menuService } from "./service.js";

const MENU_CACHE_CONTROL = `public, max-age=${MENU_CACHE_TTL_MS / 1000}`;

const routes = new Hono();

routes.get("/menu", async (c) => {
  const menu = await menuService.getMenu();
  if (!menu) throw new AppError("NOT_FOUND");

  c.header("Cache-Control", MENU_CACHE_CONTROL);
  return c.json({ ok: true, ...menu } satisfies MenuResponse);
});

export const menuApi = { routes } as const;
