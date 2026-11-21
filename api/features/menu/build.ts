import { MENU_BADGES } from "./contract.js";
import type {
  MenuAddOnDto,
  MenuCategoryDto,
  MenuDto,
  MenuPairingDto,
  MenuPriceOptionDto,
  MenuProductDto,
} from "./contract.js";
import { menuSchema as t } from "./schema.js";

type Row<K extends keyof typeof t> = (typeof t)[K]["$inferSelect"];

/** Raw rows as loaded from the database, one array per table. */
export type MenuTables = {
  settings: Row<"settings">;
  addOns: Row<"addOns">[];
  categories: Row<"categories">[];
  products: Row<"products">[];
  options: Row<"productOptions">[];
  productAddOns: Row<"productAddOns">[];
  productBaristaWay: Row<"productBaristaWay">[];
  productRelated: Row<"productRelated">[];
  signatures: Row<"signatures">[];
  pairings: Row<"pairings">[];
  pairingItems: Row<"pairingItems">[];
};

function groupBy<T, K extends keyof T>(rows: T[], key: K): Map<T[K], T[]> {
  const groups = new Map<T[K], T[]>();
  for (const row of rows) {
    const group = groups.get(row[key]);
    if (group) group.push(row);
    else groups.set(row[key], [row]);
  }
  return groups;
}

const priced = (price: number, discount: number) => ({
  price,
  discount,
  final: price - discount,
});

/** Turns raw table rows into the public menu response. Pure: no I/O. */
export function buildMenu(tables: MenuTables): MenuDto {
  const optionsByProduct = groupBy(tables.options, "productId");
  const addOnsByProduct = groupBy(tables.productAddOns, "productId");
  const baristaByProduct = groupBy(tables.productBaristaWay, "productId");
  const relatedByProduct = groupBy(tables.productRelated, "productId");
  const productsByCategory = groupBy(tables.products, "categoryId");
  const itemsByPairing = groupBy(tables.pairingItems, "pairingId");

  const toProduct = (p: Row<"products">): MenuProductDto => ({
    id: p.id,
    name: { en: p.nameEn, ar: p.nameAr },
    description: { en: p.descriptionEn, ar: p.descriptionAr },
    image: p.image,
    availability: p.availability,
    badge: p.badge,
    addOns: (addOnsByProduct.get(p.id) ?? []).map((r) => r.addOnId),
    baristaWay: (baristaByProduct.get(p.id) ?? []).map((r) => r.addOnId),
    oftenOrderedWith: (relatedByProduct.get(p.id) ?? []).map(
      (r) => r.relatedProductId
    ),
    pricing: {
      type: p.pricingType,
      options: (optionsByProduct.get(p.id) ?? []).map(
        (o): MenuPriceOptionDto => ({
          id: o.id,
          name:
            o.nameEn !== null && o.nameAr !== null
              ? { en: o.nameEn, ar: o.nameAr }
              : null,
          ...priced(o.price, o.discount),
        })
      ),
    },
  });

  const categories: MenuCategoryDto[] = tables.categories.map((c) => ({
    id: c.id,
    name: { en: c.nameEn, ar: c.nameAr },
    products: (productsByCategory.get(c.id) ?? []).map(toProduct),
  }));

  const uncategorized = (productsByCategory.get(null) ?? []).map(toProduct);
  if (uncategorized.length > 0)
    categories.push({ id: null, name: null, products: uncategorized });

  const addOns: Record<string, MenuAddOnDto> = Object.fromEntries(
    tables.addOns.map((a) => [
      a.id,
      { name: { en: a.nameEn, ar: a.nameAr }, price: a.price },
    ])
  );

  const pairings: MenuPairingDto[] = tables.pairings.map((p) => ({
    id: p.id,
    items: (itemsByPairing.get(p.id) ?? []).map((i) => i.productId),
    pricing: priced(p.price, p.discount),
  }));

  return {
    updatedAt: tables.settings.updatedAt.toISOString(),
    currency: tables.settings.currency,
    badges: [...MENU_BADGES],
    addOns,
    categories,
    signatures: tables.signatures.map((s) => s.productId),
    pairings,
    popup: {
      enabled: tables.settings.popupEnabled,
      image: tables.settings.popupImage,
      delaySeconds: tables.settings.popupDelaySeconds,
    },
  };
}
