import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check your root .env file.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./api/db/schema.ts",
  out: "./api/drizzle",
  dbCredentials: { url: databaseUrl },
});
