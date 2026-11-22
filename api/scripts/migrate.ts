import { db } from "../config.js";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

try {
  await migrate(db, { migrationsFolder: "./api/drizzle" });
  console.info("Migrations applied.");
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Migration failed.");
  process.exit(1);
}
