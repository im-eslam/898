import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "../../base/database.js";
import { adminSchema } from "./schema.js";

const { users, sessions } = adminSchema;

class AdminQueries {
  async findUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user ?? null;
  }

  async upsertUser(username: string, passwordHash: string): Promise<number> {
    const [user] = await db.insert(users).values({ username, passwordHash })
      .onConflictDoUpdate({ target: users.username, set: { passwordHash } })
      .returning({ id: users.id });

    return user.id;
  }

  async deleteSessionsForUser(userId: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async deleteExpiredSessions(now: Date): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, now));
  }

  async insertSession(tokenHash: string, userId: number, expiresAt: Date): Promise<void> {
    await db.insert(sessions).values({ tokenHash, userId, expiresAt });
  }

  async findActiveSession(tokenHash: string, now: Date) {
    const [admin] = await db
      .select({ id: users.id, username: users.username, language: users.language })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    return admin ?? null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
}

const adminQueriesImpl = new AdminQueries();

export const adminQueries = {
  findUserByUsername: (username: string) => adminQueriesImpl.findUserByUsername(username),
  upsertUser: (username: string, passwordHash: string) => adminQueriesImpl.upsertUser(username, passwordHash),
  deleteSessionsForUser: (userId: number) => adminQueriesImpl.deleteSessionsForUser(userId),
  deleteExpiredSessions: (now: Date) => adminQueriesImpl.deleteExpiredSessions(now),
  insertSession: (tokenHash: string, userId: number, expiresAt: Date) =>
    adminQueriesImpl.insertSession(tokenHash, userId, expiresAt),
  findActiveSession: (tokenHash: string, now: Date) => adminQueriesImpl.findActiveSession(tokenHash, now),
  deleteSession: (tokenHash: string) => adminQueriesImpl.deleteSession(tokenHash),
} as const;
