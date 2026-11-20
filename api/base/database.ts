import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "./config.js";

const pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });
export const db = drizzle({ client: pool });
