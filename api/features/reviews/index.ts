import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { http } from "../../base/http.js";
import { createLogger } from "../../base/logger.js";
import { adminApi, type AdminEnv } from "../admin/index.js";
import type {
  CreateReviewResponse,
  DeleteReviewsResponse,
  ReviewListResponse,
} from "./contract.js";
import { reviewsService } from "./service.js";
import { reviewValidation } from "./validation.js";

export type * from "./contract.js";

const log = createLogger("reviews");

const routes = new Hono<AdminEnv>();

routes.post(
  "/review",
  zValidator("json", reviewValidation.create, http.invalidInput),
  async (c) => {
    const { website, ...review } = c.req.valid("json");
    if (website) {
      log.warn("Honeypot submission discarded", { ip: http.clientIp(c) });
      return c.json({ ok: true } satisfies CreateReviewResponse);
    }
    await reviewsService.create(review);
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
