import { count, desc, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db } from "../../base/database.js";
import { type ReviewRow, reviewsSchema } from "./schema.js";
import type { NewReview } from "./validation.js";

const { reviews } = reviewsSchema;

class ReviewQueries {
  async insert(input: NewReview): Promise<void> {
    await db.insert(reviews).values(input);
  }

  async countMatching(search?: string): Promise<number> {
    const [{ total }] = await db
      .select({ total: count() })
      .from(reviews)
      .where(this.searchFilter(search));
    return total;
  }

  async findPage(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<ReviewRow[]> {
    return db
      .select()
      .from(reviews)
      .where(this.searchFilter(search))
      .orderBy(desc(reviews.createdAt), desc(reviews.id))
      .limit(limit)
      .offset(offset);
  }

  async deleteByIds(ids: number[]): Promise<number> {
    const deleted = await db
      .delete(reviews)
      .where(inArray(reviews.id, ids))
      .returning({ id: reviews.id });

    return deleted.length;
  }

  private searchFilter(search?: string): SQL | undefined {
    if (!search) return undefined;

    const escaped = search.replace(/[\\%_]/g, "\\$&");
    const pattern = `%${escaped}%`;
    return or(
      ilike(reviews.name, pattern),
      ilike(reviews.contact, pattern),
      ilike(reviews.message, pattern)
    );
  }
}

const reviewQueriesImpl = new ReviewQueries();

export const reviewQueries = {
  insert: (input: NewReview) => reviewQueriesImpl.insert(input),
  countMatching: (search?: string) => reviewQueriesImpl.countMatching(search),
  findPage: (search: string | undefined, limit: number, offset: number) =>
    reviewQueriesImpl.findPage(search, limit, offset),
  deleteByIds: (ids: number[]) => reviewQueriesImpl.deleteByIds(ids),
} as const;
