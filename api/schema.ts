import { adminSchema } from "./features/admin/schema.js";
import { menuRelations, menuSchema } from "./features/menu/schema.js";
import { reviewsSchema } from "./features/reviews/schema.js";

export * from "./features/admin/schema.js";
export * from "./features/menu/schema.js";
export * from "./features/reviews/schema.js";

export const schema = {
  ...adminSchema,
  ...reviewsSchema,
  ...menuSchema,
  ...menuRelations,
} as const;
