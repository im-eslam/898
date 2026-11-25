// Local development only. Vercel never runs this file.
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env, logger } from "./config.js";

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`Listening on http://localhost:${info.port} (${env.NODE_ENV})`);
});
