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

  return result.data;
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
