import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { z } from "zod";
import { logger } from "../../config.js";
import {
  AppError,
  type AddOnUsage,
  type AdminMenuState,
  type CategoryUsage,
  type MenuCreated,
  type MenuDeleted,
  type MenuOk,
  type MenuResponse,
  type ProductUsage,
} from "../../contracts.js";
import { adminApi, type AdminEnv } from "../admin/index.js";
import { MENU_BADGES, MENU_PRICING_TYPES } from "./contract.js";
import {
  MENU_CACHE_TTL_MS,
  menuAdminService,
  menuService,
  readImage,
} from "./service.js";

const MAX_NAME = 120;
const MAX_DESCRIPTION = 1000;
const MAX_MONEY = 100_000;
const MAX_LIST = 100;

const localized = (max: number) =>
  z.strictObject({
    en: z.string().trim().min(1).max(max),
    ar: z.string().trim().min(1).max(max),
  });

const id = z.number().int().positive();
const money = z.number().int().min(0).max(MAX_MONEY);
const idList = z.array(id).max(MAX_LIST);

const pricingOption = z.strictObject({
  name: localized(MAX_NAME).nullable(),
  price: money,
  discount: money,
});

const pricing = z.strictObject({
  type: z.enum(MENU_PRICING_TYPES),
  options: z.array(pricingOption).min(1).max(10),
});

export const productInput = z.strictObject({
  categoryId: id.nullable(),
  name: localized(MAX_NAME),
  description: localized(MAX_DESCRIPTION),
  isAvailable: z.boolean(),
  badge: z.enum(MENU_BADGES).nullable(),
  pricing,
  addOnIds: idList,
  baristaWayAddOnIds: idList,
  oftenOrderedWithIds: idList,
});

export const productOrderInput = z.strictObject({
  categoryId: id.nullable(),
  productIds: idList,
});

export const categoryInput = z.strictObject({ name: localized(MAX_NAME) });

export const categoryOrderInput = z.strictObject({ ids: idList });

export const addOnInput = z.strictObject({
  name: localized(MAX_NAME),
  price: money,
});

export const addOnOrderInput = z.strictObject({ ids: idList });

export const pairingInput = z.strictObject({
  productIds: z.array(id).length(2),
  price: money,
  discount: money,
});

export const popupInput = z.strictObject({
  enabled: z.boolean(),
  delaySeconds: z.number().int().min(0).max(30),
});

export const signaturesInput = z.strictObject({ productIds: idList });

const MENU_CACHE_CONTROL = `public, max-age=${MENU_CACHE_TTL_MS / 1000}`;

const log = logger.child({ scope: "menu-admin" });

function invalid(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const issue = error.issues[0];
  const detail = issue ? `${issue.path.map(String).join(".")}: ${issue.message}` : "";
  return new AppError("INVALID_INPUT", detail || "INVALID_INPUT");
}

const rejectInvalid = (result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) => {
  if (!result.success && result.error) throw invalid(result.error);
  if (!result.success) throw new AppError("INVALID_INPUT");
};

function idParam(c: Context): number {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id < 1) throw new AppError("MENU_ITEM_NOT_FOUND", "Menu item not found");
  return id;
}

async function readForm(c: Context) {
  try {
    return await c.req.parseBody();
  } catch {
    throw new AppError("INVALID_INPUT", "Expected multipart form data");
  }
}

function parseDataField<T>(schema: z.ZodType<T>, raw: unknown): T {
  if (typeof raw !== "string") throw new AppError("INVALID_INPUT", "data is required");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new AppError("INVALID_INPUT", "data must be valid JSON");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw invalid(parsed.error);
  return parsed.data;
}

const done = (c: Context<AdminEnv>, action: string, extra?: Record<string, unknown>) => {
  log.info({ admin: c.get("admin").username, action, ...extra }, "Menu changed");
  return c.json({ ok: true } satisfies MenuOk);
};

const guard = adminApi.requireAdmin;

const routes = new Hono<AdminEnv>();

routes.get("/menu", async (c) => {
  const menu = await menuService.getMenu();
  if (!menu) throw new AppError("NOT_FOUND");

  c.header("Cache-Control", MENU_CACHE_CONTROL);
  return c.json({ ok: true, ...menu } satisfies MenuResponse);
});

routes.get("/admin/menu", guard, async (c) =>
  c.json({ ok: true, ...(await menuAdminService.getState()) } satisfies AdminMenuState & { ok: true })
);

routes.put(
  "/admin/menu/popup",
  guard,
  zValidator("json", popupInput, rejectInvalid),
  async (c) => {
    await menuAdminService.updatePopup(c.req.valid("json"));
    return done(c, "popup.update");
  }
);

routes.put("/admin/menu/popup/image", guard, async (c) => {
  const form = await readForm(c);
  await menuAdminService.replacePopupImage(await readImage(form.image));
  return done(c, "popup.image");
});

routes.put(
  "/admin/menu/signatures",
  guard,
  zValidator("json", signaturesInput, rejectInvalid),
  async (c) => {
    await menuAdminService.replaceSignatures(c.req.valid("json").productIds);
    return done(c, "signatures.replace");
  }
);

routes.post(
  "/admin/menu/pairings",
  guard,
  zValidator("json", pairingInput, rejectInvalid),
  async (c) => {
    const id = await menuAdminService.createPairing(c.req.valid("json"));
    return c.json({ ok: true, id } satisfies MenuCreated, 201);
  }
);
routes.put(
  "/admin/menu/pairings/:id",
  guard,
  zValidator("json", pairingInput, rejectInvalid),
  async (c) => {
    await menuAdminService.updatePairing(idParam(c), c.req.valid("json"));
    return done(c, "pairing.update");
  }
);
routes.delete("/admin/menu/pairings/:id", guard, async (c) => {
  await menuAdminService.deletePairing(idParam(c));
  log.info({ admin: c.get("admin").username, action: "pairing.delete" }, "Menu changed");
  return c.json({ ok: true, removed: {} } satisfies MenuDeleted);
});

routes.put(
  "/admin/menu/add-ons/order",
  guard,
  zValidator("json", addOnOrderInput, rejectInvalid),
  async (c) => {
    await menuAdminService.reorderAddOns(c.req.valid("json").ids);
    return done(c, "addOns.reorder");
  }
);
routes.get("/admin/menu/add-ons/:id/usage", guard, async (c) =>
  c.json({ ok: true, usage: await menuAdminService.addOnUsage(idParam(c)) } satisfies { ok: true; usage: AddOnUsage })
);
routes.post(
  "/admin/menu/add-ons",
  guard,
  zValidator("json", addOnInput, rejectInvalid),
  async (c) => {
    const id = await menuAdminService.createAddOn(c.req.valid("json"));
    return c.json({ ok: true, id } satisfies MenuCreated, 201);
  }
);
routes.put(
  "/admin/menu/add-ons/:id",
  guard,
  zValidator("json", addOnInput, rejectInvalid),
  async (c) => {
    await menuAdminService.updateAddOn(idParam(c), c.req.valid("json"));
    return done(c, "addOn.update");
  }
);
routes.delete("/admin/menu/add-ons/:id", guard, async (c) => {
  const removed = await menuAdminService.deleteAddOn(idParam(c));
  log.info({ admin: c.get("admin").username, action: "addOn.delete" }, "Menu changed");
  return c.json({ ok: true, removed } satisfies MenuDeleted);
});

routes.put(
  "/admin/menu/categories/order",
  guard,
  zValidator("json", categoryOrderInput, rejectInvalid),
  async (c) => {
    await menuAdminService.reorderCategories(c.req.valid("json").ids);
    return done(c, "categories.reorder");
  }
);
routes.get("/admin/menu/categories/:id/usage", guard, async (c) =>
  c.json({ ok: true, usage: await menuAdminService.categoryUsage(idParam(c)) } satisfies { ok: true; usage: CategoryUsage })
);
routes.post(
  "/admin/menu/categories",
  guard,
  zValidator("json", categoryInput, rejectInvalid),
  async (c) => {
    const id = await menuAdminService.createCategory(c.req.valid("json"));
    return c.json({ ok: true, id } satisfies MenuCreated, 201);
  }
);
routes.put(
  "/admin/menu/categories/:id",
  guard,
  zValidator("json", categoryInput, rejectInvalid),
  async (c) => {
    await menuAdminService.updateCategory(idParam(c), c.req.valid("json"));
    return done(c, "category.update");
  }
);
routes.delete("/admin/menu/categories/:id", guard, async (c) => {
  const removed = await menuAdminService.deleteCategory(idParam(c));
  log.info({ admin: c.get("admin").username, action: "category.delete" }, "Menu changed");
  return c.json({ ok: true, removed } satisfies MenuDeleted);
});

routes.post("/admin/menu/products", guard, async (c) => {
  const form = await readForm(c);
  const input = parseDataField(productInput, form.data);
  const id = await menuAdminService.createProduct(input, await readImage(form.image));
  log.info({ admin: c.get("admin").username, action: "product.create", id }, "Menu changed");
  return c.json({ ok: true, id } satisfies MenuCreated, 201);
});
routes.put(
  "/admin/menu/products/order",
  guard,
  zValidator("json", productOrderInput, rejectInvalid),
  async (c) => {
    const body = c.req.valid("json");
    await menuAdminService.reorderProducts(body.categoryId, body.productIds);
    return done(c, "products.reorder");
  }
);
routes.get("/admin/menu/products/:id/usage", guard, async (c) =>
  c.json({ ok: true, usage: await menuAdminService.productUsage(idParam(c)) } satisfies { ok: true; usage: ProductUsage })
);
routes.put(
  "/admin/menu/products/:id",
  guard,
  zValidator("json", productInput, rejectInvalid),
  async (c) => {
    await menuAdminService.updateProduct(idParam(c), c.req.valid("json"));
    return done(c, "product.update");
  }
);
routes.put("/admin/menu/products/:id/image", guard, async (c) => {
  const form = await readForm(c);
  await menuAdminService.replaceProductImage(idParam(c), await readImage(form.image));
  return done(c, "product.image");
});
routes.delete("/admin/menu/products/:id", guard, async (c) => {
  const removed = await menuAdminService.deleteProduct(idParam(c));
  log.info({ admin: c.get("admin").username, action: "product.delete" }, "Menu changed");
  return c.json({ ok: true, removed } satisfies MenuDeleted);
});

export const menuApi = { routes } as const;
