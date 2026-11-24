import bcrypt from "bcryptjs";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db, logger } from "../../config.js";
import type { AdminDto } from "../../contracts.js";
import { ADMIN_LANGUAGES, type AdminLanguage } from "./contract.js";
import { ADMIN_LIMITS, sessions, users } from "./schema.js";

const log = logger.child({ scope: "admin" });

const BCRYPT_ROUNDS = 12;
const UNKNOWN_USER_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export type PasswordRuleError =
  "PASSWORD_TOO_SHORT" | "PASSWORD_TOO_LONG" | "PASSWORD_SAME_AS_USERNAME";

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

function toAdminLanguage(value: string): AdminLanguage {
  return (ADMIN_LANGUAGES as readonly string[]).includes(value)
    ? (value as AdminLanguage)
    : "en";
}

function toAdminDto(row: {
  id: number;
  username: string;
  language: string;
}): AdminDto {
  return {
    id: row.id,
    username: row.username,
    language: toAdminLanguage(row.language),
  };
}

function isUniqueViolation(error: unknown): boolean {
  const direct = (error as { code?: unknown } | null)?.code;
  const wrapped = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  return direct === "23505" || wrapped === "23505";
}

export function isValidUsername(username: string): boolean {
  return ADMIN_LIMITS.username.pattern.test(username);
}

export function findPasswordError(
  password: string,
  username: string
): PasswordRuleError | null {
  const { min, max } = ADMIN_LIMITS.password;

  if (password.length < min) return "PASSWORD_TOO_SHORT";
  if (new TextEncoder().encode(password).length > max)
    return "PASSWORD_TOO_LONG";
  if (password.toLowerCase() === username.toLowerCase())
    return "PASSWORD_SAME_AS_USERNAME";
  return null;
}

export const adminService = {
  async verifyCredentials(
    username: string,
    password: string
  ): Promise<AdminDto | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    const valid = await bcrypt
      .compare(password, user?.passwordHash ?? UNKNOWN_USER_HASH)
      .catch(() => false);
    if (!user || !valid) return null;

    return toAdminDto(user);
  },

  async startSession(adminId: number): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const now = new Date();

    const expired = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, now))
      .returning({ tokenHash: sessions.tokenHash });
    if (expired.length)
      log.debug({ removed: expired.length }, "Expired sessions removed");

    await db.insert(sessions).values({
      tokenHash: hashToken(token),
      userId: adminId,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    });

    return token;
  },

  async findAdminByToken(token: string): Promise<AdminDto | null> {
    const [row] = await db
      .select({
        id: users.id,
        username: users.username,
        language: users.language,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return row ? toAdminDto(row) : null;
  },

  async endSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  },

  async changeUsername(adminId: number, username: string): Promise<boolean> {
    const next = username.toLowerCase();

    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, next))
      .limit(1);
    if (taken && taken.id !== adminId) return false;

    try {
      await db
        .update(users)
        .set({ username: next })
        .where(eq(users.id, adminId));
    } catch (error) {
      if (isUniqueViolation(error)) return false;
      throw error;
    }

    log.info({ userId: adminId, username: next }, "Admin username changed");
    return true;
  },

  async updateLanguage(
    adminId: number,
    language: AdminLanguage
  ): Promise<void> {
    await db.update(users).set({ language }).where(eq(users.id, adminId));
  },

  async updatePassword(
    adminId: number,
    password: string,
    keepToken?: string
  ): Promise<void> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await db.update(users).set({ passwordHash }).where(eq(users.id, adminId));

    const sessionOwner = eq(sessions.userId, adminId);
    const revoked = await db
      .delete(sessions)
      .where(
        keepToken
          ? and(sessionOwner, ne(sessions.tokenHash, hashToken(keepToken)))
          : sessionOwner
      )
      .returning({ tokenHash: sessions.tokenHash });

    log.info(
      { userId: adminId, sessionsRevoked: revoked.length },
      "Admin password changed"
    );
  },

  async findAdminIdByUsername(username: string): Promise<number | null> {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);
    return row?.id ?? null;
  },

  async createAdmin(
    username: string,
    password: string
  ): Promise<AdminDto | null> {
    const normalized = username.toLowerCase();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let row: { id: number; language: string };
    try {
      [row] = await db
        .insert(users)
        .values({ username: normalized, passwordHash })
        .returning({ id: users.id, language: users.language });
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }

    log.info({ userId: row.id, username: normalized }, "Admin created");
    return toAdminDto({ ...row, username: normalized });
  },
} as const;
