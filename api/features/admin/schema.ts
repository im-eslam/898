import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const adminLimits = {
  username: { max: 50 },
  password: { max: 72 },
} as const;

const users = pgTable("admin_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: adminLimits.username.max }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  language: varchar({ length: 5 }).notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const sessions = pgTable("admin_sessions", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const adminSchema = { users, sessions } as const;
