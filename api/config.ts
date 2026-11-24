import { getConnInfo } from "@hono/node-server/conninfo";
import { Pool } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import type { Context } from "hono";
import pino from "pino";
import { z } from "zod";
import { schema } from "./schema.js";

export const env = (() => {
  const result = z
    .object({
      NODE_ENV: z.string().default("development"),
      DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
      CORS_ORIGINS: z
        .string()
        .default("http://localhost:5173,http://localhost:4173")
        .transform((value) =>
          value
            .split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
        ),
      TRUST_PROXY: z
        .enum(["0", "1"])
        .default("0")
        .transform((value) => value === "1"),
      PORT: z.coerce.number().int().default(3000),
      COOKIE_SECURE: z.enum(["0", "1"]).optional(),
      COOKIE_SAMESITE: z.enum(["Strict", "Lax", "None"]).default("Strict"),
      LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace"])
        .default("info"),
    })
    .safeParse(process.env);

  if (!result.success) {
    console.error(
      "ERROR [env] Environment validation failed. Check your root .env file.",
      result.error.issues.map((issue) => ({
        field: issue.path.map(String).join(".") || "(root)",
        problem: issue.message,
      }))
    );
    process.exit(1);
  }

  const { COOKIE_SECURE, ...data } = result.data;
  const cookieSecure =
    COOKIE_SECURE === undefined
      ? data.NODE_ENV === "production"
      : COOKIE_SECURE === "1";
  const isProduction = data.NODE_ENV === "production";

  const problems: string[] = [];
  if (isProduction && !cookieSecure)
    problems.push(
      "COOKIE_SECURE=0 is not allowed in production. Serve the site over https and leave COOKIE_SECURE unset or set it to 1."
    );
  if (isProduction) {
    const insecure = data.CORS_ORIGINS.filter((origin) =>
      origin.startsWith("http://")
    );
    if (insecure.length)
      problems.push(
        `CORS_ORIGINS must list your https frontend origin in production (found: ${insecure.join(", ")}).`
      );
  }
  if (data.COOKIE_SAMESITE === "None" && !cookieSecure)
    problems.push(
      "COOKIE_SAMESITE=None requires COOKIE_SECURE=1 (browsers reject SameSite=None cookies without Secure)."
    );

  if (problems.length) {
    console.error("ERROR [env] Unsafe configuration:", problems);
    process.exit(1);
  }

  return { ...data, cookieSecure };
})();

export const logger = pino({ level: env.LOG_LEVEL });

export function clientIp(c: Context): string {
  if (env.TRUST_PROXY) {
    const forwarded = c.req.header("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded.split(",");
      return hops[hops.length - 1].trim();
    }
  }
  const hasSocket = Boolean(
    (c.env as { incoming?: unknown } | undefined)?.incoming
  );
  return hasSocket ? (getConnInfo(c).remote.address ?? "unknown") : "unknown";
}

export const db = drizzle({
  client: new Pool({ connectionString: env.DATABASE_URL, max: 10 }),
  schema,
});
