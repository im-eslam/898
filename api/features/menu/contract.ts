export type LocalizedText = { en: string; ar: string };

export const MENU_CURRENCIES = ["EGP"] as const;
export const MENU_BADGES = ["top", "new"] as const;
export const MENU_AVAILABILITY = ["in_stock", "out_of_stock"] as const;
export const MENU_PRICING_TYPES = ["single", "multiple"] as const;

export type MenuCurrency = (typeof MENU_CURRENCIES)[number];
export type MenuBadge = (typeof MENU_BADGES)[number];
export type MenuAvailability = (typeof MENU_AVAILABILITY)[number];
export type MenuPricingType = (typeof MENU_PRICING_TYPES)[number];

export type MenuPriceDto = {
  price: number;
  discount: number;
  final: number;
};

export type MenuPriceOptionDto = MenuPriceDto & {
  id: number;
  name: LocalizedText | null;
};

export type MenuAddOnDto = {
  id: number;
  name: LocalizedText;
  price: number;
};

/** A product as it appears in another product's "often ordered" list. */
export type MenuProductRefDto = {
  id: number;
  name: LocalizedText;
  image: string;
  availability: MenuAvailability;
  price: MenuPriceDto | null;
};

export type MenuProductDto = {
  id: number;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  availability: MenuAvailability;
  badge: MenuBadge | null;
  pricing: {
    type: MenuPricingType;
    options: MenuPriceOptionDto[];
  };
  addOns: MenuAddOnDto[];
  baristaWay: MenuAddOnDto[];
  oftenOrderedWith: MenuProductRefDto[];
};

export type MenuCategoryDto = {
  /** null is the group of products that have no category. */
  id: number | null;
  name: LocalizedText | null;
  products: MenuProductDto[];
};

export type MenuPairingDto = {
  id: number;
  items: MenuProductDto[];
  pricing: MenuPriceDto;
};

export type MenuDto = {
  updatedAt: string;
  currency: MenuCurrency;
  badges: MenuBadge[];
  categories: MenuCategoryDto[];
  signatures: MenuProductDto[];
  pairings: MenuPairingDto[];
  popup: {
    enabled: boolean;
    image: string | null;
    delaySeconds: number;
  };
};

export type MenuResponse = { ok: true } & MenuDto;

export type MenuApiContract = {
  "GET /api/menu": {
    response: MenuResponse;
    errors: "NOT_FOUND" | "INTERNAL_ERROR";
  };
};
