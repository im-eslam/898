import type { ContentfulStatusCode } from "hono/utils/http-status";

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
  "GET /api/menu": { response: MenuResponse; errors: "NOT_FOUND" };
};

export const MENU_ERRORS = {
  MENU_ITEM_NOT_FOUND: 404,
  MENU_REFERENCE_NOT_FOUND: 422,
  MENU_DUPLICATE_REFERENCE: 422,
  MENU_ORDER_INCOMPLETE: 422,
  MENU_SINGLE_PRICE_INVALID: 422,
  MENU_MULTIPLE_PRICE_INVALID: 422,
  MENU_DISCOUNT_INVALID: 422,
  MENU_BARISTA_NOT_IN_ADD_ONS: 422,
  MENU_SELF_RELATED: 422,
  MENU_PAIRING_ITEMS_INVALID: 422,
  MENU_POPUP_IMAGE_REQUIRED: 422,
  MENU_IMAGE_INVALID: 422,
} as const satisfies Record<string, ContentfulStatusCode>;

export type MenuErrorCode = keyof typeof MENU_ERRORS;

export type AdminPricingOption = {
  name: LocalizedText | null;
  price: number;
  discount: number;
};

export type AdminPricing = {
  type: MenuPricingType;
  options: AdminPricingOption[];
};

export type AdminProductInput = {
  categoryId: number | null;
  name: LocalizedText;
  description: LocalizedText;
  isAvailable: boolean;
  badge: MenuBadge | null;
  pricing: AdminPricing;
  addOnIds: number[];
  baristaWayAddOnIds: number[];
  oftenOrderedWithIds: number[];
};

export type AdminProduct = AdminProductInput & {
  id: number;
  position: number;
  image: string;
};

export type AdminCategoryInput = { name: LocalizedText };
export type AdminCategory = AdminCategoryInput & {
  id: number;
  position: number;
};

export type AdminAddOnInput = { name: LocalizedText; price: number };
export type AdminAddOn = AdminAddOnInput & { id: number; position: number };

export type AdminPairingInput = {
  productIds: number[];
  price: number;
  discount: number;
};
export type AdminPairing = AdminPairingInput & { id: number; position: number };

export type AdminPopupInput = { enabled: boolean; delaySeconds: number };
export type AdminPopup = AdminPopupInput & { image: string | null };

export type AdminMenuState = {
  updatedAt: string | null;
  currency: MenuCurrency;
  badges: MenuBadge[];
  popup: AdminPopup;
  categories: AdminCategory[];
  addOns: AdminAddOn[];
  products: AdminProduct[];
  signatures: number[];
  pairings: AdminPairing[];
};

export type ProductUsage = {
  signatures: number;
  pairings: number;
  relatedFrom: number;
};
export type AddOnUsage = { products: number; baristaWay: number };
export type CategoryUsage = { products: number };

export type MenuOk = { ok: true };
export type MenuCreated = { ok: true; id: number };
export type MenuDeleted = { ok: true; removed: Record<string, number> };

type MenuAdminError =
  MenuErrorCode | "UNAUTHORIZED" | "INVALID_INPUT" | "PAYLOAD_TOO_LARGE";

export type MultipartImageBody = { image: File };
export type MultipartProductBody = { data: string; image: File };

export type MenuAdminRoutes = {
  "GET /api/admin/menu": {
    response: AdminMenuState & { ok: true };
    errors: MenuAdminError;
  };

  "PUT /api/admin/menu/popup": {
    body: AdminPopupInput;
    response: MenuOk;
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/popup/image": {
    body: MultipartImageBody;
    response: MenuOk;
    errors: MenuAdminError;
  };

  "PUT /api/admin/menu/signatures": {
    body: { productIds: number[] };
    response: MenuOk;
    errors: MenuAdminError;
  };

  "POST /api/admin/menu/pairings": {
    body: AdminPairingInput;
    response: MenuCreated;
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/pairings/:id": {
    body: AdminPairingInput;
    response: MenuOk;
    errors: MenuAdminError;
  };
  "DELETE /api/admin/menu/pairings/:id": {
    response: MenuDeleted;
    errors: MenuAdminError;
  };

  "POST /api/admin/menu/add-ons": {
    body: AdminAddOnInput;
    response: MenuCreated;
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/add-ons/order": {
    body: { ids: number[] };
    response: MenuOk;
    errors: MenuAdminError;
  };
  "GET /api/admin/menu/add-ons/:id/usage": {
    response: { ok: true; usage: AddOnUsage };
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/add-ons/:id": {
    body: AdminAddOnInput;
    response: MenuOk;
    errors: MenuAdminError;
  };
  "DELETE /api/admin/menu/add-ons/:id": {
    response: MenuDeleted;
    errors: MenuAdminError;
  };

  "POST /api/admin/menu/categories": {
    body: AdminCategoryInput;
    response: MenuCreated;
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/categories/order": {
    body: { ids: number[] };
    response: MenuOk;
    errors: MenuAdminError;
  };
  "GET /api/admin/menu/categories/:id/usage": {
    response: { ok: true; usage: CategoryUsage };
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/categories/:id": {
    body: AdminCategoryInput;
    response: MenuOk;
    errors: MenuAdminError;
  };
  "DELETE /api/admin/menu/categories/:id": {
    response: MenuDeleted;
    errors: MenuAdminError;
  };

  "POST /api/admin/menu/products": {
    body: MultipartProductBody;
    response: MenuCreated;
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/products/order": {
    body: { categoryId: number | null; productIds: number[] };
    response: MenuOk;
    errors: MenuAdminError;
  };
  "GET /api/admin/menu/products/:id/usage": {
    response: { ok: true; usage: ProductUsage };
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/products/:id": {
    body: AdminProductInput;
    response: MenuOk;
    errors: MenuAdminError;
  };
  "PUT /api/admin/menu/products/:id/image": {
    body: MultipartImageBody;
    response: MenuOk;
    errors: MenuAdminError;
  };
  "DELETE /api/admin/menu/products/:id": {
    response: MenuDeleted;
    errors: MenuAdminError;
  };
};
