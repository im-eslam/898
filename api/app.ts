import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger as httpLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./base/config.js";
import { AppError } from "./base/errors.js";
import { http } from "./base/http.js";
import { createLogger } from "./base/logger.js";
import { adminApi } from "./features/admin/index.js";
import { healthApi } from "./features/health/index.js";
import { reviewsApi } from "./features/reviews/index.js";

const log = createLogger("api");
export const app = new Hono();

app.use("*", httpLogger(), secureHeaders());
app.use(
  "/api/*",
  cors({
    origin: (origin) => (env.CORS_ORIGINS.includes(origin) ? origin : null),
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
  bodyLimit({
    maxSize: 16 * 1024,
    onError: (c) =>
      http.respondWithError(
        c,
        new AppError("PAYLOAD_TOO_LARGE", "Payload too large")
      ),
  })
);

app.route("/api", healthApi.routes);
app.route("/api", adminApi.routes);
app.route("/api", reviewsApi.routes);
app.notFound((c) =>
  http.respondWithError(c, new AppError("NOT_FOUND", "Not found"))
);

app.onError((error, c) => {
  const info = http.requestInfo(c);

  if (error instanceof AppError) {
    if (error.status >= 500)
      log.error("Server error", { ...info, message: error.message });
    else
      log.warn("Request failed", {
        ...info,
        status: error.status,
        code: error.code,
      });
    return http.respondWithError(c, error);
  }

  if (error instanceof HTTPException) {
    log.warn("HTTP exception", { ...info, status: error.status });
    return http.respondWithError(
      c,
      new AppError("HTTP_ERROR", error.message, { status: error.status })
    );
  }

  const cause = error instanceof Error ? error.cause : undefined;
  log.error("Unhandled server error", {
    ...info,
    name: error instanceof Error ? error.name : typeof error,
    reason: error instanceof Error ? error.message : String(error),
    cause:
      cause instanceof Error
        ? `${cause.name}: ${cause.message}`
        : cause === undefined
          ? undefined
          : String(cause),
    stack: error instanceof Error ? error.stack : undefined,
  });
  return http.respondWithError(
    c,
    new AppError("INTERNAL_ERROR", "Server error")
  );
});
