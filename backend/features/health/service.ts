import { sql } from "drizzle-orm";
import { db, logger } from "../../config.js";

const log = logger.child({ scope: "health" });

const CHECK_TIMEOUT_MS = 2_500;

async function pingDatabase(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`no answer within ${CHECK_TIMEOUT_MS} ms`)),
      CHECK_TIMEOUT_MS
    );
  });
  try {
    await Promise.race([db.execute(sql`select 1`), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export const healthService = {
  async checkDatabase(): Promise<boolean> {
    const started = performance.now();
    const elapsed = () => Math.round(performance.now() - started);
    try {
      await pingDatabase();
      log.debug({ ms: elapsed() }, "Database check passed");
      return true;
    } catch (error) {
      log.error(
        { err: error, ms: elapsed(), timeoutMs: CHECK_TIMEOUT_MS },
        "Database check failed"
      );
      return false;
    }
  },
} as const;
