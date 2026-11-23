import { asc, isNull } from "drizzle-orm";
import { db, logger } from "../../config.js";
import { AppError, type MenuDto } from "../../contracts.js";
import { mapMenu } from "./mapper.js";
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

const log = logger.child({ scope: "menu" });

const productWith = {
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

function loadRows() {
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

function warnUncategorized(menu: MenuDto): void {
  const uncategorized = menu.categories.find((c) => c.id === null);
  if (!uncategorized) return;

  log.warn(
    {
      count: uncategorized.products.length,
      productIds: uncategorized.products.map((p) => p.id),
    },
    "Menu has uncategorized products"
  );
}

async function build(): Promise<MenuDto> {
  const menu = mapMenu(await loadRows());
  warnUncategorized(menu);
  return menu;
}

let cache: { value: Promise<MenuDto>; expiresAt: number } | null = null;
export const MENU_CACHE_TTL_MS = 60 * 1000;

export type MenuRows = Awaited<ReturnType<typeof loadRows>>;

export const menuService = {
  getMenu(): Promise<MenuDto> {
    if (cache && cache.expiresAt > Date.now()) return cache.value;

    const value: Promise<MenuDto> = build().catch((error) => {
      if (cache?.value === value) cache = null;
      throw error;
    });
    cache = { value, expiresAt: Date.now() + MENU_CACHE_TTL_MS };
    return value;
  },
} as const;
