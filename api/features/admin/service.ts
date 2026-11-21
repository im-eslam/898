import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db } from "../../base/database.js";
import { createLogger } from "../../base/logger.js";
import type { AdminProfile } from "./contract.js";
import { adminSchema } from "./schema.js";
import { adminValidation } from "./validation.js";

const { users, sessions } = adminSchema;

export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const SESSION_LOOKUP_RETRIES = 2;
const RETRY_DELAY_MS = 100;

const log = createLogger("admin");
const dummyHash = bcrypt.hashSync("not-a-real-password", 12);

export type Admin = { id: number; username: string; language: string };

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

async function findActiveAdmin(
  tokenHash: string,
  now: Date
): Promise<Admin | null> {
  const [admin] = await db
    .select({
      id: users.id,
      username: users.username,
      language: users.language,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  return admin ?? null;
}

export const adminService = {
  async authenticate(
    username: string,
    password: string
  ): Promise<Admin | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()))
      .limit(1);

    const valid = await bcrypt
      .compare(password, user?.passwordHash ?? dummyHash)
      .catch(() => false);
    if (!user || !valid) return null;

    return { id: user.id, username: user.username, language: user.language };
  },

  async createSession(userId: number): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    const now = new Date();

    await db.delete(sessions).where(lt(sessions.expiresAt, now));
    await db.insert(sessions).values({
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    });

    return token;
  },

  async findBySession(token: string): Promise<Admin | null> {
    const tokenHash = hashToken(token);

    for (let attempt = 0; ; attempt++) {
      try {
        return await findActiveAdmin(tokenHash, new Date());
      } catch (error) {
        if (attempt >= SESSION_LOOKUP_RETRIES) throw error;

        log.warn("Session lookup failed, retrying", {
          attempt: attempt + 1,
          reason: error instanceof Error ? error.message : String(error),
        });
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  },

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  },

  async createOrUpdateAdmin(username: string, password: string): Promise<void> {
    adminValidation.assertNewAdmin(username, password);

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ username: username.toLowerCase(), passwordHash })
      .onConflictDoUpdate({ target: users.username, set: { passwordHash } })
      .returning({ id: users.id });

    await db.delete(sessions).where(eq(sessions.userId, user.id));
  },

  toProfile(admin: Admin): AdminProfile {
    return { username: admin.username, language: admin.language };
  },
} as const;
