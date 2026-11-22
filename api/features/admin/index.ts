import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { env } from "../../base/config.js";
import { AppError, type Ok } from "../../base/errors.js";
import { http } from "../../base/http.js";
import { createLogger } from "../../base/logger.js";
import { createRateLimiter } from "../../base/rate-limiter.js";
import type { LoginResponse, MeResponse } from "./contract.js";
import { type Admin, adminService, SESSION_TTL_MS } from "./service.js";
import { adminValidation } from "./validation.js";

export type * from "./contract.js";

export type AdminEnv = { Variables: { admin: Admin } };

const SESSION_COOKIE = "admin_session";
const loginLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });
const cookieOptions = {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "Strict" as const,
};
const log = createLogger("admin");

const requireAdmin = createMiddleware<AdminEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  const admin = token ? await adminService.findBySession(token) : null;

  if (!admin) throw new AppError("UNAUTHORIZED", "Unauthorized");

  c.set("admin", admin);
  await next();
});

const routes = new Hono<AdminEnv>();

routes.post(
  "/admin/login",
  zValidator("json", adminValidation.login, (result, c) => {
    if (!result.success) {
      return http.respondWithError(
        c,
        new AppError("INVALID_CREDENTIALS", "Invalid credentials")
      );
    }
  }),
  async (c) => {
    const ip = http.clientIp(c);
    const retryAfter = loginLimiter.getRetryAfter(ip);

    if (retryAfter) {
      log.warn("Login rate-limited", { ip, retryAfterSec: retryAfter });
      throw new AppError("RATE_LIMITED", "Too many attempts", {
        headers: { "Retry-After": String(retryAfter) },
      });
    }

    const { username, password } = c.req.valid("json");
    const admin = await adminService.authenticate(username, password);

    if (!admin) {
      loginLimiter.record(ip);
      log.warn("Login failed", { username, ip });
      throw new AppError("INVALID_CREDENTIALS", "Invalid credentials");
    }

    loginLimiter.reset(ip);
    const token = await adminService.createSession(admin.id);
    setCookie(c, SESSION_COOKIE, token, {
      ...cookieOptions,
      maxAge: SESSION_TTL_MS / 1000,
    });

    log.info("Login succeeded", { username: admin.username, ip });
    return c.json({
      ok: true,
      user: adminService.toProfile(admin),
    } satisfies LoginResponse);
  }
);

routes.post("/admin/logout", requireAdmin, async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await adminService.deleteSession(token);

  deleteCookie(c, SESSION_COOKIE, cookieOptions);
  log.info("Logout", { username: c.get("admin").username });
  return c.json({ ok: true } satisfies Ok);
});

routes.get("/admin/me", requireAdmin, (c) =>
  c.json({
    ok: true,
    user: adminService.toProfile(c.get("admin")),
  } satisfies MeResponse)
);

export const adminApi = {
  routes,
  requireAdmin,
  createOrUpdateAdmin: (username: string, password: string) =>
    adminService.createOrUpdateAdmin(username, password),
} as const;
