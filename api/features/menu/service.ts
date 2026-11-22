

import { logger } from "../../config.js";
import type { MenuDto } from "../../contracts.js";
import { mapMenu } from "./mapper.js";
import { loadMenuRows } from "./repository.js";

const log = logger.child({ scope: "menu" });

/** How long a built menu is reused. Edits made by the seed script appear within this window. */
const CACHE_TTL_MS = 60 * 1000;

async function loadAndBuild(): Promise<MenuDto> {
  const menu = mapMenu(await loadMenuRows());

  const uncategorized = menu.categories.find((c) => c.id === null);
  if (uncategorized)
    log.warn(
      {
        count: uncategorized.products.length,
        productIds: uncategorized.products.map((p) => p.id),
      },
      "Menu has uncategorized products"
    );

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

export const menuService = { getMenu } as const;
