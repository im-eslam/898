import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { clientIp, env, logger } from "../../config.js";
import {
  AppError,
  type AdminDto,
  type LoginResponse,
  type MeResponse,
  type Ok,
} from "../../contracts.js";
import { adminLimits } from "./schema.js";
import { adminService, SESSION_TTL_MS } from "./service.js";

export type AdminEnv = { Variables: { admin: AdminDto; token: string } };

const log = logger.child({ scope: "admin" });

const SESSION_COOKIE = "admin_session";
const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "Strict" as const,
};

const loginBody = z.object({
  username: z.string().trim().max(adminLimits.username.max),
  password: z.string().min(1).max(adminLimits.password.max),
});

const requireAdmin = createMiddleware<AdminEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  const admin = token ? await adminService.findAdminByToken(token) : null;
  if (!token || !admin) throw new AppError("UNAUTHORIZED", "Unauthorized");

  c.set("admin", admin);
  c.set("token", token);
  await next();
});

const routes = new Hono<AdminEnv>();

routes.post(
  "/admin/login",
  zValidator("json", loginBody, (result) => {
    if (!result.success)
      throw new AppError("INVALID_CREDENTIALS", "Invalid credentials");
  }),
  async (c) => {
    const { username, password } = c.req.valid("json");
    const ip = clientIp(c);

    const admin = await adminService.verifyCredentials(username, password);
    if (!admin) {
      log.warn({ username, ip }, "Login failed");
      const error = new AppError("INVALID_CREDENTIALS", "Invalid credentials");
      return c.json(error.toBody(), error.status);
    }

    const token = await adminService.startSession(admin.id);
    setCookie(c, SESSION_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_TTL_MS / 1000,
    });

    log.info({ username: admin.username, ip }, "Login succeeded");
    return c.json({ ok: true, user: admin } satisfies LoginResponse);
  }
);

routes.post("/admin/logout", requireAdmin, async (c) => {
  await adminService.endSession(c.get("token"));
  deleteCookie(c, SESSION_COOKIE, COOKIE_OPTIONS);

  log.info({ username: c.get("admin").username }, "Logout");
  return c.json({ ok: true } satisfies Ok);
});

routes.get("/admin/me", requireAdmin, (c) =>
  c.json({ ok: true, user: c.get("admin") } satisfies MeResponse)
);

export const adminApi = { routes, requireAdmin } as const;
