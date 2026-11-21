export type LocalizedText = { en: string; ar: string };

export const MENU_CURRENCIES = ["EGP"] as const;
export const MENU_BADGES = ["top", "new"] as const;
export const MENU_AVAILABILITY = ["in_stock", "out_of_stock"] as const;
export const MENU_PRICING_TYPES = ["single", "multiple"] as const;

export type MenuCurrency = (typeof MENU_CURRENCIES)[number];
export type MenuBadge = (typeof MENU_BADGES)[number];
export type MenuAvailability = (typeof MENU_AVAILABILITY)[number];
export type MenuPricingType = (typeof MENU_PRICING_TYPES)[number];

export type MenuAddOnDto = {
  name: LocalizedText;
  price: number;
};

export type MenuPriceOptionDto = {
  id: number;
  name: LocalizedText | null;
  price: number;
  discount: number;
  final: number;
};

export type MenuProductDto = {
  id: number;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  availability: MenuAvailability;
  badge: MenuBadge | null;
  addOns: number[];
  baristaWay: number[];
  oftenOrderedWith: number[];
  pricing: {
    type: MenuPricingType;
    options: MenuPriceOptionDto[];
  };
};

export type MenuCategoryDto = {
  id: number | null;
  name: LocalizedText | null;
  products: MenuProductDto[];
};

export type MenuPairingDto = {
  id: number;
  items: number[];
  pricing: {
    price: number;
    discount: number;
    final: number;
  };
};

export type MenuDto = {
  updatedAt: string;
  currency: MenuCurrency;
  badges: MenuBadge[];
  addOns: Record<string, MenuAddOnDto>;
  categories: MenuCategoryDto[];
  signatures: number[];
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
