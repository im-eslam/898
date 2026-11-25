import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const ADMIN_LIMITS = {
  username: { min: 3, max: 50, pattern: /^[a-zA-Z0-9._-]{3,50}$/ },
  password: { min: 10, max: 72 },
} as const;

export const users = pgTable("admin_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: ADMIN_LIMITS.username.max }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  language: varchar({ length: 5 }).notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("admin_sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const adminSchema = { users, sessions } as const;
