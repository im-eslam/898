import { asc } from "drizzle-orm";
import { db } from "../../base/database.js";
import { AppError } from "../../base/errors.js";
import { createLogger } from "../../base/logger.js";
import { buildMenu, type MenuTables } from "./build.js";
import type { MenuDto } from "./contract.js";
import { menuSchema as t } from "./schema.js";

const log = createLogger("menu");

/** How long a built menu is reused. Edits made by the seed script appear within this window. */
const CACHE_TTL_MS = 60 * 1000;

async function loadTables(): Promise<MenuTables> {
  return db.transaction(
    async (tx) => {
      const [settings] = await tx.select().from(t.settings).limit(1);
      if (!settings) throw new AppError("NOT_FOUND", "Menu not found");

      return {
        settings,
        addOns: await tx.select().from(t.addOns).orderBy(asc(t.addOns.position)),
        categories: await tx
          .select()
          .from(t.categories)
          .orderBy(asc(t.categories.position)),
        products: await tx
          .select()
          .from(t.products)
          .orderBy(asc(t.products.categoryId), asc(t.products.position)),
        options: await tx
          .select()
          .from(t.productOptions)
          .orderBy(asc(t.productOptions.productId), asc(t.productOptions.position)),
        productAddOns: await tx
          .select()
          .from(t.productAddOns)
          .orderBy(asc(t.productAddOns.productId), asc(t.productAddOns.position)),
        productBaristaWay: await tx
          .select()
          .from(t.productBaristaWay)
          .orderBy(asc(t.productBaristaWay.productId), asc(t.productBaristaWay.position)),
        productRelated: await tx
          .select()
          .from(t.productRelated)
          .orderBy(asc(t.productRelated.productId), asc(t.productRelated.position)),
        signatures: await tx
          .select()
          .from(t.signatures)
          .orderBy(asc(t.signatures.position)),
        pairings: await tx.select().from(t.pairings).orderBy(asc(t.pairings.position)),
        pairingItems: await tx
          .select()
          .from(t.pairingItems)
          .orderBy(asc(t.pairingItems.pairingId), asc(t.pairingItems.position)),
      };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" }
  );
}

async function loadAndBuild(): Promise<MenuDto> {
  const menu = buildMenu(await loadTables());

  const uncategorized = menu.categories.find((c) => c.id === null);
  if (uncategorized)
    log.warn("Menu has uncategorized products", {
      count: uncategorized.products.length,
      productIds: uncategorized.products.map((p) => p.id),
    });

  return menu;
}

let cached: { value: Promise<MenuDto>; expiresAt: number } | null = null;

function getMenu(): Promise<MenuDto> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value: Promise<MenuDto> = loadAndBuild().catch((error) => {
    // Don't cache failures: the next request should retry.
    if (cached?.value === value) cached = null;
    throw error;
  });
  cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}

function invalidateMenu(): void {
  cached = null;
}

export const menuService = { getMenu, invalidateMenu } as const;
