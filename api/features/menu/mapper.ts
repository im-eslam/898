import {
  MENU_BADGES,
  type MenuAddOnDto,
  type MenuCategoryDto,
  type MenuDto,
  type MenuPairingDto,
  type MenuPriceDto,
  type MenuPriceOptionDto,
  type MenuProductDto,
  type MenuProductRefDto,
} from "./contract.js";
import type { MenuRows } from "./repository.js";

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

function toAddOn(addOn: { id: number; nameEn: string; nameAr: string; price: number }): MenuAddOnDto {
  return {
    id: addOn.id,
    name: { en: addOn.nameEn, ar: addOn.nameAr },
    price: addOn.price,
  };
}

function toRef(product: RawProduct["relatedLinks"][number]["relatedProduct"]): MenuProductRefDto {
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
    oftenOrderedWith: product.relatedLinks.map((link) => toRef(link.relatedProduct)),
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

/** Turns the loaded rows into the menu response. Pure: no I/O. */
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
    signatures: rows.signatures.map((signature) => toProduct(signature.product)),
    pairings: rows.pairings.map(toPairing),
    popup: {
      enabled: rows.settings.popupEnabled,
      image: rows.settings.popupImage,
      delaySeconds: rows.settings.popupDelaySeconds,
    },
  };
}
