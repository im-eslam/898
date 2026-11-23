export const MENU_CURRENCIES = ["EGP"] as const;
export const MENU_BADGES = ["top", "new"] as const;
export const MENU_AVAILABILITIES = ["in_stock", "out_of_stock"] as const;
export const MENU_PRICING_TYPES = ["single", "multiple"] as const;

export type MenuCurrency = (typeof MENU_CURRENCIES)[number];
export type MenuBadge = (typeof MENU_BADGES)[number];
export type MenuAvailability = (typeof MENU_AVAILABILITIES)[number];
export type MenuPricingType = (typeof MENU_PRICING_TYPES)[number];

export type LocalizedText = { en: string; ar: string };

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

export type MenuResponse = MenuDto & { ok: true };

export type MenuRoutes = {
  "GET /api/menu": { response: MenuResponse };
};
