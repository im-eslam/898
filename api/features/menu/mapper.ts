import type {
  MenuAddOnDto,
  MenuCategoryDto,
  MenuDto,
  MenuPairingDto,
  MenuPriceDto,
  MenuPriceOptionDto,
  MenuProductDto,
  MenuProductRefDto,
} from "../../contracts.js";
import {
  MENU_BADGES,
  type AdminMenuState,
  type MenuCurrency,
} from "./contract.js";
import type { AdminRows, MenuRows } from "./service.js";

type RawCategory = MenuRows["categories"][number];
type RawProduct = MenuRows["uncategorized"][number];
type RawPairing = MenuRows["pairings"][number];

function toPrice(price: number, discount: number): MenuPriceDto {
  return { price, discount, final: price - discount };
}

function toOption(option: RawProduct["options"][number]): MenuPriceOptionDto {
  return {
    id: option.id,
    name:
      option.nameEn !== null && option.nameAr !== null
        ? { en: option.nameEn, ar: option.nameAr }
        : null,
    ...toPrice(option.price, option.discount),
  };
}

function toAddOn(addOn: {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
}): MenuAddOnDto {
  return {
    id: addOn.id,
    name: { en: addOn.nameEn, ar: addOn.nameAr },
    price: addOn.price,
  };
}

function toRef(
  product: RawProduct["relatedLinks"][number]["relatedProduct"]
): MenuProductRefDto {
  const first = product.options[0];
  return {
    id: product.id,
    name: { en: product.nameEn, ar: product.nameAr },
    image: product.image,
    availability: product.availability,
    price: first ? toPrice(first.price, first.discount) : null,
  };
}

function toProduct(product: RawProduct): MenuProductDto {
  return {
    id: product.id,
    name: { en: product.nameEn, ar: product.nameAr },
    description: { en: product.descriptionEn, ar: product.descriptionAr },
    image: product.image,
    availability: product.availability,
    badge: product.badge,
    pricing: {
      type: product.pricingType,
      options: product.options.map(toOption),
    },
    addOns: product.addOnLinks.map((link) => toAddOn(link.addOn)),
    baristaWay: product.baristaLinks.map((link) => toAddOn(link.addOn)),
    oftenOrderedWith: product.relatedLinks.map((link) =>
      toRef(link.relatedProduct)
    ),
  };
}

function toCategory(category: RawCategory): MenuCategoryDto {
  return {
    id: category.id,
    name: { en: category.nameEn, ar: category.nameAr },
    products: category.products.map(toProduct),
  };
}

function toPairing(pairing: RawPairing): MenuPairingDto {
  return {
    id: pairing.id,
    items: pairing.items.map((item) => toProduct(item.product)),
    pricing: toPrice(pairing.price, pairing.discount),
  };
}

export function mapMenu(rows: MenuRows): MenuDto {
  const categories = rows.categories.map(toCategory);

  if (rows.uncategorized.length > 0) {
    categories.push({
      id: null,
      name: null,
      products: rows.uncategorized.map(toProduct),
    });
  }

  return {
    updatedAt: rows.settings.updatedAt.toISOString(),
    currency: rows.settings.currency,
    badges: [...MENU_BADGES],
    categories,
    signatures: rows.signatures.map((signature) =>
      toProduct(signature.product)
    ),
    pairings: rows.pairings.map(toPairing),
    popup: {
      enabled: rows.settings.popupEnabled,
      image: rows.settings.popupImage,
      delaySeconds: rows.settings.popupDelaySeconds,
    },
  };
}

function groupBy<T>(items: T[], key: (item: T) => number): Map<number, T[]> {
  const groups = new Map<number, T[]>();
  for (const item of items) {
    const k = key(item);
    groups.set(k, [...(groups.get(k) ?? []), item]);
  }
  return groups;
}

export function mapAdminState(rows: AdminRows): AdminMenuState {
  const settings = rows.settings;
  const currency: MenuCurrency = settings?.currency ?? "EGP";

  const options = groupBy(rows.options, (o) => o.productId);
  const addOnLinks = groupBy(rows.addOnLinks, (l) => l.productId);
  const baristaLinks = groupBy(rows.baristaLinks, (l) => l.productId);
  const relatedLinks = groupBy(rows.relatedLinks, (l) => l.productId);
  const pairingItems = groupBy(rows.pairingItems, (i) => i.pairingId);

  return {
    updatedAt: settings?.updatedAt.toISOString() ?? null,
    currency,
    badges: [...MENU_BADGES],
    popup: {
      enabled: settings?.popupEnabled ?? false,
      image: settings?.popupImage ?? null,
      delaySeconds: settings?.popupDelaySeconds ?? 1,
    },
    categories: rows.categories.map((c) => ({
      id: c.id,
      name: { en: c.nameEn, ar: c.nameAr },
      position: c.position,
    })),
    addOns: rows.addOns.map((a) => ({
      id: a.id,
      name: { en: a.nameEn, ar: a.nameAr },
      price: a.price,
      position: a.position,
    })),
    products: rows.products.map((p) => ({
      id: p.id,
      categoryId: p.categoryId,
      position: p.position,
      name: { en: p.nameEn, ar: p.nameAr },
      description: { en: p.descriptionEn, ar: p.descriptionAr },
      image: p.image,
      isAvailable: p.availability === "in_stock",
      badge: p.badge,
      pricing: {
        type: p.pricingType,
        options: (options.get(p.id) ?? []).map((o) => ({
          name:
            o.nameEn !== null && o.nameAr !== null
              ? { en: o.nameEn, ar: o.nameAr }
              : null,
          price: o.price,
          discount: o.discount,
        })),
      },
      addOnIds: (addOnLinks.get(p.id) ?? []).map((l) => l.addOnId),
      baristaWayAddOnIds: (baristaLinks.get(p.id) ?? []).map((l) => l.addOnId),
      oftenOrderedWithIds: (relatedLinks.get(p.id) ?? []).map(
        (l) => l.relatedProductId
      ),
    })),
    signatures: rows.signatures.map((s) => s.productId),
    pairings: rows.pairings.map((pairing) => ({
      id: pairing.id,
      position: pairing.position,
      productIds: (pairingItems.get(pairing.id) ?? []).map((i) => i.productId),
      price: pairing.price,
      discount: pairing.discount,
    })),
  };
}
