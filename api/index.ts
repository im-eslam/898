import { serve } from "@hono/node-server";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { secureHeaders } from "hono/secure-headers";
import { clientIp, env, logger } from "./config.js";
import { AppError } from "./contracts.js";

import { adminApi } from "./features/admin/index.js";
import { healthApi } from "./features/health/index.js";
import { menuApi } from "./features/menu/index.js";
import { reviewsApi } from "./features/reviews/index.js";

class Api {
  readonly app = new Hono();

  constructor() {
    this.app.use("*", compress());
    this.app.use("*", secureHeaders(), this.logRequests);
    this.app.use("/api/*", this.allowCors(), this.limitBody());
    this.app.route("/api", healthApi.routes);
    this.app.route("/api", adminApi.routes);
    this.app.route("/api", reviewsApi.routes);
    this.app.route("/api", menuApi.routes);
    this.app.notFound((c) => {
      const error = new AppError("NOT_FOUND", "Not found");
      return c.json(error.toBody(), error.status);
    });
    this.app.onError(this.handleError);
  }

  listen(port: number): void {
    serve({ fetch: this.app.fetch, port }, (info) => {
      logger.info(
        `Listening on http://localhost:${info.port} (${env.NODE_ENV})`
      );
    });
  }

  private allowCors() {
    return cors({
      origin: (origin) => (env.CORS_ORIGINS.includes(origin) ? origin : null),
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    });
  }

  private limitBody() {
    const onError = (c: Context) => {
      const error = new AppError("PAYLOAD_TOO_LARGE", "Payload too large");
      return c.json(error.toBody(), error.status);
    };
    const small = bodyLimit({ maxSize: 16 * 1024, onError });
    const menu = bodyLimit({ maxSize: 64 * 1024, onError });
    const upload = bodyLimit({ maxSize: 6 * 1024 * 1024, onError });

    return (c: Context, next: () => Promise<void>) => {
      if (!c.req.path.startsWith("/api/admin/menu")) return small(c, next);
      const multipart = c.req
        .header("content-type")
        ?.startsWith("multipart/form-data");
      return (multipart ? upload : menu)(c, next);
    };
  }

  private readonly logRequests = async (
    c: Context,
    next: () => Promise<void>
  ) => {
    const started = performance.now();
    await next();

    const isHealthyProbe = c.req.path === "/api/health" && c.res.status < 400;
    logger[isHealthyProbe ? "debug" : "info"](
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        ms: Math.round(performance.now() - started),
      },
      "Request"
    );
  };

  private readonly handleError = (
    error: Error | HTTPException,
    c: Context
  ): Response => {
    const request = { method: c.req.method, path: c.req.path, ip: clientIp(c) };

    if (error instanceof AppError) {
      if (error.status >= 500)
        logger.error({ ...request, err: error }, "Server error");
      else
        logger.warn(
          { ...request, code: error.code, status: error.status },
          "Request failed"
        );
      return c.json(error.toBody(), error.status);
    }

    if (error instanceof HTTPException) {
      logger.warn({ ...request, status: error.status }, "HTTP exception");
      const wrapped = new AppError("HTTP_ERROR", error.message, error.status);
      return c.json(wrapped.toBody(), wrapped.status);
    }

    logger.error({ ...request, err: error }, "Unhandled server error");
    const internal = new AppError("INTERNAL_ERROR", "Server error");
    return c.json(internal.toBody(), internal.status);
  };
}

export const api = new Api();
export const app = api.app;
api.listen(env.PORT);
