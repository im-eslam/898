import { zValidator } from "@hono/zod-validator";
import { clientIp, logger } from "../../config.js";
import { Hono } from "hono";
import { AppError } from "../../contracts.js";

import type {
  DeleteReviewsResponse,
  Ok,
  ReviewListResponse,
} from "../../contracts.js";
import { adminApi, type AdminEnv } from "../admin/index.js";
import { reviewsService } from "./service.js";
import { reviewValidation } from "./validation.js";

const log = logger.child({ scope: "reviews" });

const rejectInvalid = (result: { success: boolean }) => {
  if (!result.success) throw new AppError("INVALID_INPUT", "Invalid input");
};

const routes = new Hono<AdminEnv>();

routes.post(
  "/review",
  zValidator("json", reviewValidation.create, rejectInvalid),
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
  zValidator("query", reviewValidation.list, rejectInvalid),
  async (c) => {
    const page = await reviewsService.list(c.req.valid("query"));
    return c.json({ ok: true, ...page } satisfies ReviewListResponse);
  }
);

routes.post(
  "/admin/reviews/delete",
  adminApi.requireAdmin,
  zValidator("json", reviewValidation.remove, rejectInvalid),
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
