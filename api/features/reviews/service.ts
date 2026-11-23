import { count, desc, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db } from "../../config.js";
import type {
  CreateReviewRequest,
  ReviewDto,
  ReviewListQuery,
  ReviewPageDto,
} from "../../contracts.js";
import { reviews, reviewLimits } from "./schema.js";

function buildSearchFilter(search?: string): SQL | undefined {
  if (!search) return undefined;
  const escaped = search.replace(/[\\%_]/g, "\\$&");
  const pattern = `%${escaped}%`;
  return or(
    ilike(reviews.name, pattern),
    ilike(reviews.contact, pattern),
    ilike(reviews.message, pattern)
  );
}

export const reviewsService = {
  async create(input: Omit<CreateReviewRequest, "website">): Promise<void> {
    await db.insert(reviews).values(input);
  },

  async list({
    q,
    page = 1,
    per_page = reviewLimits.paging.defaultPerPage,
  }: ReviewListQuery): Promise<ReviewPageDto> {
    const where = buildSearchFilter(q);

    const [{ total }] = await db
      .select({ total: count() })
      .from(reviews)
      .where(where);

    if (total === 0) {
      return { items: [], page: 1, per_page, total: 0, total_pages: 1 };
    }

    const totalPages = Math.ceil(total / per_page);
    const currentPage = Math.min(page, totalPages);

    const rows = await db
      .select()
      .from(reviews)
      .where(where)
      .orderBy(desc(reviews.createdAt), desc(reviews.id))
      .limit(per_page)
      .offset((currentPage - 1) * per_page);

    const items: ReviewDto[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      contact: row.contact,
      message: row.message,
      created_at: row.createdAt.toISOString(),
    }));

    return {
      items,
      page: currentPage,
      per_page,
      total,
      total_pages: totalPages,
    };
  },

  async delete(ids: number[]): Promise<number> {
    const deleted = await db
      .delete(reviews)
      .where(inArray(reviews.id, ids))
      .returning({ id: reviews.id });

    return deleted.length;
  },
} as const;
