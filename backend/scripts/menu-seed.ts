import { sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { db } from "../config.js";

const SEED_SQL_PATH = fileURLToPath(
  new URL("../storage/menu-seed.sql", import.meta.url)
);

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

let seedSql: string;
try {
  seedSql = await readFile(SEED_SQL_PATH, "utf8");
} catch (error) {
  die(
    `Cannot read seed file at ${SEED_SQL_PATH}: ` +
      (error instanceof Error ? error.message : String(error))
  );
}

try {
  await db.execute(sql.raw(seedSql));
  console.info("Menu seeded aucessfuly");
  process.exit(0);
} catch (error) {
  die(error instanceof Error ? error.message : "Menu seed failed.");
}
