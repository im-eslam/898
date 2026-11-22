import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";
import { env } from "./config.js";
import { AppError } from "./errors.js";

type ValidationResult = { success: boolean };

class HttpHelpers {
  respondWithError(c: Context, error: AppError): Response {
    for (const [name, value] of Object.entries(error.headers))
      c.header(name, value);
    return c.json(error.toBody(), error.status);
  }

  invalidInput(result: ValidationResult, c: Context): Response | undefined {
    if (result.success) return undefined;
    return this.respondWithError(
      c,
      new AppError("INVALID_INPUT", "Invalid input")
    );
  }

  clientIp(c: Context): string {
    if (env.TRUST_PROXY) {
      const forwarded = c.req.header("x-forwarded-for");
      if (forwarded) {
        // The proxy appends the address it saw, so the last entry is the one we trust.
        // The first entry is whatever the client sent, and can be faked.
        const hops = forwarded.split(",");
        return hops[hops.length - 1].trim();
      }
    }

    const hasSocket = Boolean(
      (c.env as { incoming?: unknown } | undefined)?.incoming
    );
    return hasSocket ? (getConnInfo(c).remote.address ?? "unknown") : "unknown";
  }

  requestInfo(c: Context) {
    return { method: c.req.method, path: c.req.path, ip: this.clientIp(c) };
  }
}

const helpers = new HttpHelpers();

export const http = {
  respondWithError: (c: Context, error: AppError) =>
    helpers.respondWithError(c, error),
  invalidInput: (result: ValidationResult, c: Context) =>
    helpers.invalidInput(result, c),
  clientIp: (c: Context) => helpers.clientIp(c),
  requestInfo: (c: Context) => helpers.requestInfo(c),
} as const;
