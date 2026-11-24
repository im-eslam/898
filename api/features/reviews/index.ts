import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { clientIp, logger } from "../../config.js";
import {
  AppError,
  type DeleteReviewsResponse,
  type Ok,
  type ReviewListResponse,
} from "../../contracts.js";
import { adminApi, type AdminEnv } from "../admin/index.js";
import { reviewLimits } from "./schema.js";
import { reviewsService } from "./service.js";

const log = logger.child({ scope: "reviews" });

const noNulBytes = (value: string) => !value.includes("\0");

const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine(noNulBytes, "Invalid character")
    .refine(
      (value) => [...value].length >= min && [...value].length <= max,
      `Must be ${min} to ${max} characters`
    );

const numericParam = (fallback: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((value) =>
      Math.min(max, Math.max(1, Number(value ?? fallback)))
    );

const createBody = z.object({
  message: text(reviewLimits.message.min, reviewLimits.message.max),
  name: text(0, reviewLimits.name.max)
    .optional()
    .transform((value) => value ?? ""),
  contact: text(0, reviewLimits.contact.max)
    .optional()
    .transform((value) => value ?? ""),
  website: z.string().max(200).optional(),
});

const listQuery = z.object({
  q: z
    .string()
    .trim()
    .max(reviewLimits.search.max)
    .refine(noNulBytes, "Invalid character")
    .optional(),
  page: numericParam(1, reviewLimits.paging.maxPage),
  per_page: numericParam(
    reviewLimits.paging.defaultPerPage,
    reviewLimits.paging.maxPerPage
  ),
});

const deleteBody = z.object({
  ids: z
    .array(z.number().int().min(1).max(2_147_483_647))
    .min(1)
    .max(reviewLimits.bulkDelete.maxIds)
    .transform((ids) => [...new Set(ids)]),
});

const rejectInvalid = (result: { success: boolean }) => {
  if (!result.success) throw new AppError("INVALID_INPUT");
};

const routes = new Hono<AdminEnv>();

routes.post(
  "/review",
  zValidator("json", createBody, rejectInvalid),
  async (c) => {
    const { website, ...review } = c.req.valid("json");
    if (website) {
      log.warn({ ip: clientIp(c) }, "Honeypot submission discarded");
      return c.json({ ok: true } satisfies Ok);
    }
    await reviewsService.create(review);
    return c.json({ ok: true } satisfies Ok, 201);
  }
);

routes.get(
  "/admin/reviews",
  adminApi.requireAdmin,
  zValidator("query", listQuery, rejectInvalid),
  async (c) => {
    const page = await reviewsService.list(c.req.valid("query"));
    return c.json({ ok: true, ...page } satisfies ReviewListResponse);
  }
);

routes.post(
  "/admin/reviews/delete",
  adminApi.requireAdmin,
  zValidator("json", deleteBody, rejectInvalid),
  async (c) => {
    const deleted = await reviewsService.delete(c.req.valid("json").ids);

    log.info(
      { count: deleted, admin: c.get("admin").username },
      "Reviews deleted"
    );
    return c.json({ ok: true, deleted } satisfies DeleteReviewsResponse);
  }
);

export const reviewsApi = { routes } as const;
