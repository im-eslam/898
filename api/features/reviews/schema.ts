import { index, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const reviewLimits = {
  message: { min: 3, max: 1000 },
  name: { max: 80 },
  contact: { max: 120 },
  search: { max: 120 },
  bulkDelete: { maxIds: 100 },
  paging: { defaultPerPage: 20, maxPerPage: 100, maxPage: 100_000 },
} as const;

const reviews = pgTable("reviews", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: reviewLimits.name.max }).notNull().default(""),
  contact: varchar({ length: reviewLimits.contact.max }).notNull().default(""),
  message: varchar({ length: reviewLimits.message.max }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("idx_reviews_created_at_id").on(table.createdAt.desc(), table.id.desc())]);

export const reviewsSchema = { reviews } as const;

export type ReviewRow = typeof reviews.$inferSelect;
