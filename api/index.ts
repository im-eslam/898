import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./base/config.js";
import { createLogger } from "./base/logger.js";

const log = createLogger("api");

serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
  log.info(`Listening on http://localhost:${port} (${env.NODE_ENV})`);
});
