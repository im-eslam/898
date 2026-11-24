import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db, logger } from "../../config.js";
import { AppError, type AdminDto } from "../../contracts.js";
import { adminLimits, sessions, users } from "./schema.js";

const log = logger.child({ scope: "admin" });

const BCRYPT_ROUNDS = 12;
const UNKNOWN_USER_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

function assertValidNewAdmin(username: string, password: string): void {
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
    throw new Error(
      "Username must be 3-50 characters: letters, digits, dot, underscore, dash."
    );
  }

  const passwordMatchesUsername =
    password.toLowerCase() === username.toLowerCase();
  if (
    password.length < 10 ||
    password.length > adminLimits.password.max ||
    passwordMatchesUsername
  ) {
    throw new Error(
      `Password must be 10-${adminLimits.password.max} characters and must not equal the username.`
    );
  }
}

// Postgres reports a unique-constraint violation with SQLSTATE 23505. Drizzle may
// wrap the driver error, so check the cause as well.
function isUniqueViolation(error: unknown): boolean {
  const direct = (error as { code?: unknown } | null)?.code;
  const wrapped = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  return direct === "23505" || wrapped === "23505";
}

export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

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

    return { id: user.id, username: user.username, language: user.language };
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
    const [admin] = await db
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

    return admin ?? null;
  },

  async endSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  },

  async changeUsername(adminId: number, username: string): Promise<void> {
    const next = username.toLowerCase();

    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, next))
      .limit(1);
      
    if (taken && taken.id !== adminId)
      throw new AppError("INVALID_INPUT", "Username is already taken");

    try {
      await db
        .update(users)
        .set({ username: next })
        .where(eq(users.id, adminId));
    } catch (error) {
      if (isUniqueViolation(error))
        throw new AppError("INVALID_INPUT", "Username is already taken");
      throw error;
    }

    log.info({ userId: adminId, username: next }, "Admin username changed");
  },

  async createOrUpdateAdmin(username: string, password: string): Promise<void> {
    assertValidNewAdmin(username, password);

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const [user] = await db
      .insert(users)
      .values({ username: username.toLowerCase(), passwordHash })
      .onConflictDoUpdate({ target: users.username, set: { passwordHash } })
      .returning({ id: users.id });

    const revoked = await db
      .delete(sessions)
      .where(eq(sessions.userId, user.id))
      .returning({ tokenHash: sessions.tokenHash });

    log.info(
      { username: username.toLowerCase(), sessionsRevoked: revoked.length },
      "Admin saved"
    );
  },
} as const;
