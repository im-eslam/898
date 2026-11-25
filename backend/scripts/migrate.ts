import { sql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { fileURLToPath } from "node:url";
import { db, env } from "../config.js";

const MIGRATIONS_FOLDER = fileURLToPath(new URL("../drizzle", import.meta.url));

const DROP_PUBLIC_OBJECTS_SQL = `
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
  FOR r IN
    SELECT t.typname FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  LOOP
    EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.typname);
  END LOOP;
END $$;
`;

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

if (!process.argv.includes("--force")) {
  die(
    "This deletes ALL data and rebuilds the schema from api/drizzle.\n" +
      "Usage: npm run api:migrate -- --force"
  );
}

if (env.NODE_ENV === "production") {
  die("Refusing to reset a production database.");
}

try {
  readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });
} catch (error) {
  die(
    `Cannot read migrations in ${MIGRATIONS_FOLDER}: ` +
      (error instanceof Error ? error.message : String(error))
  );
}

try {
  await db.transaction(async (tx) => {
    await tx.execute(sql.raw(DROP_PUBLIC_OBJECTS_SQL));
    await tx.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
  });
  console.info("Dropped all tables, enum types and migration history.");

  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.info("Migrations applied.");
  process.exit(0);
} catch (error) {
  die(error instanceof Error ? error.message : "Migration failed.");
}
