import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { AppError } from "../../base/errors.js";
import { http } from "../../base/http.js";
import { createLogger } from "../../base/logger.js";
import { createRateLimiter } from "../../base/rate-limiter.js";
import { adminApi, type AdminEnv } from "../admin/index.js";
import type {
  CreateReviewResponse,
  DeleteReviewsResponse,
  ReviewDto,
  ReviewListResponse,
  ReviewPageDto,
} from "./contract.js";
import { reviewQueries } from "./query.js";
import type { ReviewRow } from "./schema.js";
import {
  reviewValidation,
  type NewReview,
  type ReviewListQuery,
} from "./validation.js";

export type * from "./contract.js";

const log = createLogger("reviews");
const submitLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60 * 1000 });

class ReviewsService {
  async create(input: NewReview): Promise<void> {
    await reviewQueries.insert(input);
  }

  async list(query: ReviewListQuery): Promise<ReviewPageDto> {
    const total = await reviewQueries.countMatching(query.q);

    const totalPages = Math.max(1, Math.ceil(total / query.per_page));
    const page = Math.min(query.page, totalPages);
    const rows = await reviewQueries.findPage(
      query.q,
      query.per_page,
      (page - 1) * query.per_page
    );

    return {
      items: rows.map((row) => this.toDto(row)),
      page,
      per_page: query.per_page,
      total,
      total_pages: totalPages,
    };
  }

  async delete(ids: number[]): Promise<number> {
    return reviewQueries.deleteByIds(ids);
  }

  private toDto(row: ReviewRow): ReviewDto {
    return {
      id: row.id,
      name: row.name,
      contact: row.contact,
      message: row.message,
      created_at: row.createdAt.toISOString(),
    };
  }
}

const reviewsService = new ReviewsService();

const limitSubmissions = createMiddleware(async (c, next) => {
  const ip = http.clientIp(c);
  const retryAfter = submitLimiter.getRetryAfter(ip);

  if (retryAfter) {
    log.warn("Submission rate-limited", { ip, retryAfterSec: retryAfter });
    throw new AppError("RATE_LIMITED", "Too many requests", {
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  submitLimiter.record(ip);
  await next();
});

const routes = new Hono<AdminEnv>();

routes.post(
  "/review",
  limitSubmissions,
  zValidator("json", reviewValidation.create, http.invalidInput),
  async (c) => {
    const input = c.req.valid("json");

    if (input.website) {
      log.warn("Honeypot submission discarded", { ip: http.clientIp(c) });
      return c.json({ ok: true } satisfies CreateReviewResponse);
    }

    await reviewsService.create({
      name: input.name,
      contact: input.contact,
      message: input.message,
    });
    return c.json({ ok: true } satisfies CreateReviewResponse, 201);
  }
);

routes.get(
  "/admin/reviews",
  adminApi.requireAdmin,
  zValidator("query", reviewValidation.list, http.invalidInput),
  async (c) => {
    const page = await reviewsService.list(c.req.valid("query"));
    return c.json({ ok: true, ...page } satisfies ReviewListResponse);
  }
);

routes.post(
  "/admin/reviews/delete",
  adminApi.requireAdmin,
  zValidator("json", reviewValidation.remove, http.invalidInput),
  async (c) => {
    const deleted = await reviewsService.delete(c.req.valid("json").ids);

    log.info("Reviews deleted", {
      count: deleted,
      admin: c.get("admin").username,
    });
    return c.json({ ok: true, deleted } satisfies DeleteReviewsResponse);
  }
);

export const reviewsApi = { routes } as const;
