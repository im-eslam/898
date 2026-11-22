import { db } from "../../config.js";
import { asc, isNull } from "drizzle-orm";

import { AppError } from "../../contracts.js";
import {
  menuCategories,
  menuPairingItems,
  menuPairings,
  menuProductAddOns,
  menuProductBaristaWay,
  menuProductOptions,
  menuProductRelated,
  menuProducts,
  menuSignatures,
} from "./schema.js";

/** The relations a product needs for the menu page, loaded in one query. */
export const productWith = {
  options: { orderBy: [asc(menuProductOptions.position)] },
  addOnLinks: {
    orderBy: [asc(menuProductAddOns.position)],
    with: { addOn: true as const },
  },
  baristaLinks: {
    orderBy: [asc(menuProductBaristaWay.position)],
    with: { addOn: true as const },
  },
  relatedLinks: {
    orderBy: [asc(menuProductRelated.position)],
    with: {
      relatedProduct: {
        with: { options: { orderBy: [asc(menuProductOptions.position)] } },
      },
    },
  },
};

/**
 * Loads the whole menu in one read-only, repeatable-read transaction, so every
 * part comes from the same moment.
 */
export function loadMenuRows() {
  return db.transaction(
    async (tx) => {
      const settings = await tx.query.settings.findFirst();
      if (!settings) throw new AppError("NOT_FOUND", "Menu not found");

      const categories = await tx.query.categories.findMany({
        orderBy: [asc(menuCategories.position)],
        with: {
          products: {
            orderBy: [asc(menuProducts.position)],
            with: productWith,
          },
        },
      });

      const uncategorized = await tx.query.products.findMany({
        where: isNull(menuProducts.categoryId),
        orderBy: [asc(menuProducts.position)],
        with: productWith,
      });

      const signatures = await tx.query.signatures.findMany({
        orderBy: [asc(menuSignatures.position)],
        with: { product: { with: productWith } },
      });

      const pairings = await tx.query.pairings.findMany({
        orderBy: [asc(menuPairings.position)],
        with: {
          items: {
            orderBy: [asc(menuPairingItems.position)],
            with: { product: { with: productWith } },
          },
        },
      });

      return { settings, categories, uncategorized, signatures, pairings };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" }
  );
}

export type MenuRows = Awaited<ReturnType<typeof loadMenuRows>>;
