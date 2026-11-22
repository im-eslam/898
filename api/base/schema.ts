import { adminSchema } from "../features/admin/schema.js";
import { menuRelations, menuSchema } from "../features/menu/schema.js";
import { reviewsSchema } from "../features/reviews/schema.js";

/** Every table and relation, so the database client can use the query API. */
export const schema = {
  ...adminSchema,
  ...reviewsSchema,
  ...menuSchema,
  ...menuRelations,
} as const;
