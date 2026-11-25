import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check your root .env file.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./backend/features/*/schema.ts",
  out: "./backend/drizzle",
  dbCredentials: { url: databaseUrl },
});
