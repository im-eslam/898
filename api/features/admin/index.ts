import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../../base/config.js";
import { AppError, type Ok } from "../../base/errors.js";
import { http } from "../../base/http.js";
import { createLogger } from "../../base/logger.js";
import { createRateLimiter } from "../../base/rate-limiter.js";
import type { AdminProfile, LoginResponse, MeResponse } from "./contract.js";
import { adminQueries } from "./query.js";
import { adminValidation } from "./validation.js";

export type * from "./contract.js";

type Admin = { id: number; username: string; language: string };

export type AdminEnv = { Variables: { admin: Admin } };

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const SESSION_LOOKUP_RETRIES = 2;
const RETRY_DELAY_MS = 100;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const SESSION_COOKIE = "admin_session";
const loginLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });
const cookieOptions = {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "Strict" as const,
};
const log = createLogger("admin");

class AdminService {
  private readonly dummyHash = bcrypt.hashSync("not-a-real-password", 12);

  async authenticate(
    username: string,
    password: string
  ): Promise<Admin | null> {
    const user = await adminQueries.findUserByUsername(username.toLowerCase());

    const valid = await bcrypt
      .compare(password, user?.passwordHash ?? this.dummyHash)
      .catch(() => false);
    if (!user || !valid) return null;

    return { id: user.id, username: user.username, language: user.language };
  }

  async createSession(userId: number): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const now = new Date();

    await adminQueries.deleteExpiredSessions(now);
    await adminQueries.insertSession(
      this.hashToken(token),
      userId,
      new Date(now.getTime() + SESSION_TTL_MS)
    );

    return token;
  }

  async findBySession(token: string): Promise<Admin | null> {
    const tokenHash = this.hashToken(token);

    for (let attempt = 0; ; attempt++) {
      try {
        return await adminQueries.findActiveSession(tokenHash, new Date());
      } catch (error) {
        if (attempt >= SESSION_LOOKUP_RETRIES) throw error;

        log.warn("Session lookup failed, retrying", {
          attempt: attempt + 1,
          reason: error instanceof Error ? error.message : String(error),
        });
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  async deleteSession(token: string): Promise<void> {
    await adminQueries.deleteSession(this.hashToken(token));
  }

  async createOrUpdateAdmin(username: string, password: string): Promise<void> {
    adminValidation.assertNewAdmin(username, password);

    const passwordHash = await bcrypt.hash(password, 12);
    const id = await adminQueries.upsertUser(
      username.toLowerCase(),
      passwordHash
    );

    await adminQueries.deleteSessionsForUser(id);
  }

  toProfile(admin: Admin): AdminProfile {
    return { username: admin.username, language: admin.language };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

const admins = new AdminService();

const adminService = {
  authenticate: (username: string, password: string) =>
    admins.authenticate(username, password),
  createSession: (userId: number) => admins.createSession(userId),
  findBySession: (token: string) => admins.findBySession(token),
  deleteSession: (token: string) => admins.deleteSession(token),
  createOrUpdateAdmin: (username: string, password: string) =>
    admins.createOrUpdateAdmin(username, password),
  toProfile: (admin: Admin) => admins.toProfile(admin),
} as const;

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
  createOrUpdateAdmin: adminService.createOrUpdateAdmin,
} as const;
