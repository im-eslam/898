import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
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
});

const result = envSchema.safeParse(process.env);

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

export const env = result.data;
