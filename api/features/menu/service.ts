import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { asc, count, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import sharp from "sharp";
import { db, env, logger } from "../../config.js";
import { AppError, type MenuDto } from "../../contracts.js";
import {
  MENU_CURRENCIES,
  type AddOnUsage,
  type AdminAddOnInput,
  type AdminCategoryInput,
  type AdminMenuState,
  type AdminPairingInput,
  type AdminPopupInput,
  type AdminPricing,
  type AdminProductInput,
  type CategoryUsage,
  type LocalizedText,
  type MenuAvailability,
  type ProductUsage,
} from "./contract.js";
import {
  menuAddOns,
  menuCategories,
  menuPairingItems,
  menuPairings,
  menuProductAddOns,
  menuProductBaristaWay,
  menuProductOptions,
  menuProductRelated,
  menuProducts,
  menuSettings,
  menuSignatures,
} from "./schema.js";
import { mapAdminState, mapMenu } from "./mapper.js";

const log = logger.child({ scope: "menu" });

const productWith = {
  options: { orderBy: [asc(menuProductOptions.position)] },
  addOnLinks: {
    orderBy: [asc(menuProductAddOns.position)],
    with: { addOn: true as const },
  },
  baristaLinks: {
    orderBy: [asc(menuProductBaristaWay.position)],
    with: { addOn: true as const },
  },
  relatedLinks: {
    orderBy: [asc(menuProductRelated.position)],
    with: {
      relatedProduct: {
        with: { options: { orderBy: [asc(menuProductOptions.position)] } },
      },
    },
  },
};

function loadRows() {
  return db.transaction(
    async (tx) => {
      const settings = await tx.query.settings.findFirst();
      if (!settings) return null;

      const categories = await tx.query.categories.findMany({
        orderBy: [asc(menuCategories.position)],
        with: {
          products: {
            orderBy: [asc(menuProducts.position)],
            with: productWith,
          },
        },
      });

      const uncategorized = await tx.query.products.findMany({
        where: isNull(menuProducts.categoryId),
        orderBy: [asc(menuProducts.position)],
        with: productWith,
      });

      const signatures = await tx.query.signatures.findMany({
        orderBy: [asc(menuSignatures.position)],
        with: { product: { with: productWith } },
      });

      const pairings = await tx.query.pairings.findMany({
        orderBy: [asc(menuPairings.position)],
        with: {
          items: {
            orderBy: [asc(menuPairingItems.position)],
            with: { product: { with: productWith } },
          },
        },
      });

      return { settings, categories, uncategorized, signatures, pairings };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" }
  );
}

function warnUncategorized(menu: MenuDto): void {
  const uncategorized = menu.categories.find((c) => c.id === null);
  if (!uncategorized) return;

  log.warn(
    {
      count: uncategorized.products.length,
      productIds: uncategorized.products.map((p) => p.id),
    },
    "Menu has uncategorized products"
  );
}

async function build(): Promise<MenuDto | null> {
  const rows = await loadRows();
  if (!rows) return null;

  const menu = mapMenu(rows);
  warnUncategorized(menu);
  return menu;
}

let cache: { value: Promise<MenuDto | null>; expiresAt: number } | null = null;
export const MENU_CACHE_TTL_MS = 60 * 1000;

export type MenuRows = NonNullable<Awaited<ReturnType<typeof loadRows>>>;

export const menuService = {
  invalidate(): void {
    cache = null;
  },

  getMenu(): Promise<MenuDto | null> {
    if (cache && cache.expiresAt > Date.now()) return cache.value;

    const value: Promise<MenuDto | null> = build().then(
      (menu) => {
        if (!menu && cache?.value === value) cache = null;
        return menu;
      },
      (error) => {
        if (cache?.value === value) cache = null;
        throw error;
      }
    );
    cache = { value, expiresAt: Date.now() + MENU_CACHE_TTL_MS };
    return value;
  },
} as const;

export function assertDistinct(ids: number[], field: string): void {
  if (new Set(ids).size !== ids.length)
    throw new AppError(
      "MENU_DUPLICATE_REFERENCE",
      `${field} contains the same id more than once`
    );
}

export function assertCompleteOrder(
  current: number[],
  requested: number[]
): void {
  assertDistinct(requested, "order");
  const known = new Set(current);
  if (
    requested.length !== current.length ||
    requested.some((id) => !known.has(id))
  )
    throw new AppError(
      "MENU_ORDER_INCOMPLETE",
      "Order must list every item exactly once"
    );
}

export function assertDiscount(price: number, discount: number): void {
  if (discount > price)
    throw new AppError(
      "MENU_DISCOUNT_INVALID",
      "Discount cannot exceed the price"
    );
}

export function assertPricing(pricing: AdminPricing): void {
  const { type, options } = pricing;

  if (type === "single") {
    if (options.length !== 1)
      throw new AppError(
        "MENU_SINGLE_PRICE_INVALID",
        "Single pricing needs exactly one price"
      );
    if (options[0].name !== null)
      throw new AppError(
        "MENU_SINGLE_PRICE_INVALID",
        "Single pricing must not have a size name"
      );
  } else {
    if (options.length < 2)
      throw new AppError(
        "MENU_MULTIPLE_PRICE_INVALID",
        "Multiple pricing needs at least two sizes"
      );
    if (options.some((option) => option.name === null))
      throw new AppError(
        "MENU_MULTIPLE_PRICE_INVALID",
        "Every size needs a name"
      );
  }

  for (const option of options) assertDiscount(option.price, option.discount);
}

export function assertProductInput(
  input: AdminProductInput,
  selfId?: number
): void {
  assertPricing(input.pricing);
  assertDistinct(input.addOnIds, "addOnIds");
  assertDistinct(input.baristaWayAddOnIds, "baristaWayAddOnIds");
  assertDistinct(input.oftenOrderedWithIds, "oftenOrderedWithIds");

  const addOns = new Set(input.addOnIds);
  if (input.baristaWayAddOnIds.some((id) => !addOns.has(id)))
    throw new AppError(
      "MENU_BARISTA_NOT_IN_ADD_ONS",
      "Barista-way add-ons must also be selected as add-ons"
    );

  if (selfId !== undefined && input.oftenOrderedWithIds.includes(selfId))
    throw new AppError(
      "MENU_SELF_RELATED",
      "A product cannot be ordered with itself"
    );
}

export function assertPairing(
  productIds: number[],
  price: number,
  discount: number
): void {
  if (productIds.length !== 2 || productIds[0] === productIds[1])
    throw new AppError(
      "MENU_PAIRING_ITEMS_INVALID",
      "A pairing needs exactly two different products"
    );
  assertDiscount(price, discount);
}

export function assertPopup(enabled: boolean, hasImage: boolean): void {
  if (enabled && !hasImage)
    throw new AppError(
      "MENU_POPUP_IMAGE_REQUIRED",
      "Upload a popup image before turning the popup on"
    );
}

const imageLog = logger.child({ scope: "menu-images" });

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const MENU_IMAGE_FOLDERS = {
  popup: "popup",
  productFull: "products-full",
  productThumb: "products-thumb",
} as const;

type Folder = (typeof MENU_IMAGE_FOLDERS)[keyof typeof MENU_IMAGE_FOLDERS];

const ROOT = resolve(env.MENU_IMAGE_DIR);

export async function readImage(value: unknown): Promise<Buffer> {
  if (!(value instanceof File))
    throw new AppError("INVALID_INPUT", "An image file is required");
  if (!ACCEPTED_TYPES.has(value.type) || value.size > MAX_UPLOAD_BYTES)
    throw new AppError(
      "MENU_IMAGE_INVALID",
      "Image must be a JPEG, PNG or WebP file up to 5 MB"
    );

  const buffer = Buffer.from(await value.arrayBuffer());
  try {
    await sharp(buffer).metadata();
  } catch {
    throw new AppError(
      "MENU_IMAGE_INVALID",
      "The file is not a readable image"
    );
  }
  return buffer;
}

async function writeVariant(
  folder: Folder,
  name: string,
  buffer: Buffer,
  width: number
): Promise<void> {
  let output: Buffer;
  try {
    output = await sharp(buffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new AppError(
      "MENU_IMAGE_INVALID",
      "The image could not be processed"
    );
  }

  const dir = join(ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), output);
}

async function removeFile(folder: Folder, name: string): Promise<void> {
  try {
    await unlink(join(ROOT, folder, name));
  } catch (error) {
    imageLog.warn({ folder, name, err: error }, "Could not remove menu image");
  }
}

export async function storeProductImage(buffer: Buffer): Promise<string> {
  const name = `${randomUUID()}.webp`;
  try {
    await writeVariant(MENU_IMAGE_FOLDERS.productFull, name, buffer, 1200);
    await writeVariant(MENU_IMAGE_FOLDERS.productThumb, name, buffer, 400);
  } catch (error) {
    await removeProductImage(name);
    throw error;
  }
  return name;
}

export async function removeProductImage(name: string): Promise<void> {
  await Promise.all([
    removeFile(MENU_IMAGE_FOLDERS.productFull, name),
    removeFile(MENU_IMAGE_FOLDERS.productThumb, name),
  ]);
}

export async function storePopupImage(buffer: Buffer): Promise<string> {
  const name = `${randomUUID()}.webp`;
  await writeVariant(MENU_IMAGE_FOLDERS.popup, name, buffer, 1200);
  return name;
}

export async function removePopupImage(name: string): Promise<void> {
  await removeFile(MENU_IMAGE_FOLDERS.popup, name);
}

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const READ_ONLY = {
  isolationLevel: "repeatable read",
  accessMode: "read only",
} as const;

const productInCategory = (categoryId: number | null): SQL =>
  categoryId === null
    ? isNull(menuProducts.categoryId)
    : eq(menuProducts.categoryId, categoryId);

const countOf = async (
  where: PromiseLike<{ value: number }[]>
): Promise<number> => {
  const [row] = await where;
  return Number(row?.value ?? 0);
};

export async function readAll(tx: Tx) {
  const [settings] = await tx.select().from(menuSettings).limit(1);
  return {
    settings: settings ?? null,
    categories: await tx
      .select()
      .from(menuCategories)
      .orderBy(asc(menuCategories.position)),
    addOns: await tx
      .select()
      .from(menuAddOns)
      .orderBy(asc(menuAddOns.position)),
    products: await tx
      .select()
      .from(menuProducts)
      .orderBy(asc(menuProducts.position)),
    options: await tx
      .select()
      .from(menuProductOptions)
      .orderBy(asc(menuProductOptions.position)),
    addOnLinks: await tx
      .select()
      .from(menuProductAddOns)
      .orderBy(asc(menuProductAddOns.position)),
    baristaLinks: await tx
      .select()
      .from(menuProductBaristaWay)
      .orderBy(asc(menuProductBaristaWay.position)),
    relatedLinks: await tx
      .select()
      .from(menuProductRelated)
      .orderBy(asc(menuProductRelated.position)),
    signatures: await tx
      .select()
      .from(menuSignatures)
      .orderBy(asc(menuSignatures.position)),
    pairings: await tx
      .select()
      .from(menuPairings)
      .orderBy(asc(menuPairings.position)),
    pairingItems: await tx
      .select()
      .from(menuPairingItems)
      .orderBy(asc(menuPairingItems.position)),
  };
}

export type AdminRows = Awaited<ReturnType<typeof readAll>>;

export async function ensureSettings(tx: Tx) {
  const [existing] = await tx.select().from(menuSettings).limit(1);
  if (existing) return existing;

  const [created] = await tx
    .insert(menuSettings)
    .values({ currency: MENU_CURRENCIES[0], updatedAt: new Date() })
    .returning();
  return created;
}

export async function touchSettings(
  tx: Tx,
  patch: {
    popupEnabled?: boolean;
    popupImage?: string | null;
    popupDelaySeconds?: number;
  } = {}
): Promise<void> {
  await ensureSettings(tx);
  await tx.update(menuSettings).set({ ...patch, updatedAt: new Date() });
}

export async function categoryExists(tx: Tx, id: number): Promise<boolean> {
  const [row] = await tx
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(eq(menuCategories.id, id))
    .limit(1);
  return row !== undefined;
}

export async function categoryIds(tx: Tx): Promise<number[]> {
  const rows = await tx
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .orderBy(asc(menuCategories.position));
  return rows.map((row) => row.id);
}

export async function nextCategoryPosition(tx: Tx): Promise<number> {
  const [row] = await tx
    .select({
      value: sql<number>`coalesce(max(${menuCategories.position}), -1)`,
    })
    .from(menuCategories);
  return Number(row.value) + 1;
}

export async function insertCategory(
  tx: Tx,
  name: LocalizedText,
  position: number
): Promise<number> {
  const [row] = await tx
    .insert(menuCategories)
    .values({ nameEn: name.en, nameAr: name.ar, position })
    .returning({ id: menuCategories.id });
  return row.id;
}

export async function updateCategory(
  tx: Tx,
  id: number,
  name: LocalizedText
): Promise<void> {
  await tx
    .update(menuCategories)
    .set({ nameEn: name.en, nameAr: name.ar })
    .where(eq(menuCategories.id, id));
}

export async function deleteCategoryRow(tx: Tx, id: number): Promise<void> {
  await tx.delete(menuCategories).where(eq(menuCategories.id, id));
}

export async function setCategoryPositions(
  tx: Tx,
  ids: number[]
): Promise<void> {
  for (const [position, id] of ids.entries())
    await tx
      .update(menuCategories)
      .set({ position })
      .where(eq(menuCategories.id, id));
}

export async function categoryProductCount(
  tx: Tx,
  id: number
): Promise<number> {
  return countOf(
    tx
      .select({ value: count() })
      .from(menuProducts)
      .where(eq(menuProducts.categoryId, id))
  );
}

export async function findAddOn(tx: Tx, id: number) {
  const [row] = await tx
    .select()
    .from(menuAddOns)
    .where(eq(menuAddOns.id, id))
    .limit(1);
  return row ?? null;
}

export async function allAddOnIds(tx: Tx): Promise<number[]> {
  const rows = await tx
    .select({ id: menuAddOns.id })
    .from(menuAddOns)
    .orderBy(asc(menuAddOns.position));
  return rows.map((row) => row.id);
}

export async function addOnIdsIn(tx: Tx, ids: number[]): Promise<number[]> {
  if (ids.length === 0) return [];
  const rows = await tx
    .select({ id: menuAddOns.id })
    .from(menuAddOns)
    .where(inArray(menuAddOns.id, ids));
  return rows.map((row) => row.id);
}

export async function nextAddOnPosition(tx: Tx): Promise<number> {
  const [row] = await tx
    .select({ value: sql<number>`coalesce(max(${menuAddOns.position}), -1)` })
    .from(menuAddOns);
  return Number(row.value) + 1;
}

export async function insertAddOn(
  tx: Tx,
  values: { name: LocalizedText; price: number; position: number }
): Promise<number> {
  const [row] = await tx
    .insert(menuAddOns)
    .values({
      nameEn: values.name.en,
      nameAr: values.name.ar,
      price: values.price,
      position: values.position,
    })
    .returning({ id: menuAddOns.id });
  return row.id;
}

export async function updateAddOnRow(
  tx: Tx,
  id: number,
  values: { name: LocalizedText; price: number }
): Promise<void> {
  await tx
    .update(menuAddOns)
    .set({
      nameEn: values.name.en,
      nameAr: values.name.ar,
      price: values.price,
    })
    .where(eq(menuAddOns.id, id));
}

export async function deleteAddOnRow(tx: Tx, id: number): Promise<void> {
  await tx.delete(menuAddOns).where(eq(menuAddOns.id, id));
}

export async function setAddOnPositions(tx: Tx, ids: number[]): Promise<void> {
  for (const [position, id] of ids.entries())
    await tx.update(menuAddOns).set({ position }).where(eq(menuAddOns.id, id));
}

export async function addOnUsage(
  tx: Tx,
  id: number
): Promise<{ products: number; baristaWay: number }> {
  const products = await countOf(
    tx
      .select({ value: count() })
      .from(menuProductAddOns)
      .where(eq(menuProductAddOns.addOnId, id))
  );
  const baristaWay = await countOf(
    tx
      .select({ value: count() })
      .from(menuProductBaristaWay)
      .where(eq(menuProductBaristaWay.addOnId, id))
  );
  return { products, baristaWay };
}

export function toProductColumns(input: AdminProductInput) {
  const availability: MenuAvailability = input.isAvailable
    ? "in_stock"
    : "out_of_stock";
  return {
    categoryId: input.categoryId,
    nameEn: input.name.en,
    nameAr: input.name.ar,
    descriptionEn: input.description.en,
    descriptionAr: input.description.ar,
    availability,
    badge: input.badge,
    pricingType: input.pricing.type,
  };
}

export async function findProduct(tx: Tx, id: number) {
  const [row] = await tx
    .select()
    .from(menuProducts)
    .where(eq(menuProducts.id, id))
    .limit(1);
  return row ?? null;
}

export async function productIdsIn(tx: Tx, ids: number[]): Promise<number[]> {
  if (ids.length === 0) return [];
  const rows = await tx
    .select({ id: menuProducts.id })
    .from(menuProducts)
    .where(inArray(menuProducts.id, ids));
  return rows.map((row) => row.id);
}

export async function productIdsInCategory(
  tx: Tx,
  categoryId: number | null
): Promise<number[]> {
  const rows = await tx
    .select({ id: menuProducts.id })
    .from(menuProducts)
    .where(productInCategory(categoryId))
    .orderBy(asc(menuProducts.position));
  return rows.map((row) => row.id);
}

export async function nextProductPosition(
  tx: Tx,
  categoryId: number | null
): Promise<number> {
  const [row] = await tx
    .select({ value: sql<number>`coalesce(max(${menuProducts.position}), -1)` })
    .from(menuProducts)
    .where(productInCategory(categoryId));
  return Number(row.value) + 1;
}

export async function insertProduct(
  tx: Tx,
  values: typeof menuProducts.$inferInsert
): Promise<number> {
  const [row] = await tx
    .insert(menuProducts)
    .values(values)
    .returning({ id: menuProducts.id });
  return row.id;
}

export async function updateProductRow(
  tx: Tx,
  id: number,
  values: Partial<typeof menuProducts.$inferInsert>
): Promise<void> {
  await tx.update(menuProducts).set(values).where(eq(menuProducts.id, id));
}

export async function setProductPositions(
  tx: Tx,
  ids: number[]
): Promise<void> {
  for (const [position, id] of ids.entries())
    await tx
      .update(menuProducts)
      .set({ position })
      .where(eq(menuProducts.id, id));
}

export async function moveProductsToUncategorized(
  tx: Tx,
  ids: number[]
): Promise<void> {
  let position = await nextProductPosition(tx, null);
  for (const id of ids)
    await tx
      .update(menuProducts)
      .set({ categoryId: null, position: position++ })
      .where(eq(menuProducts.id, id));
}

export async function deleteProductRow(tx: Tx, id: number): Promise<void> {
  await tx.delete(menuProducts).where(eq(menuProducts.id, id));
}

export async function replaceProductChildren(
  tx: Tx,
  productId: number,
  input: AdminProductInput
): Promise<void> {
  await tx
    .delete(menuProductOptions)
    .where(eq(menuProductOptions.productId, productId));
  await tx
    .delete(menuProductAddOns)
    .where(eq(menuProductAddOns.productId, productId));
  await tx
    .delete(menuProductBaristaWay)
    .where(eq(menuProductBaristaWay.productId, productId));
  await tx
    .delete(menuProductRelated)
    .where(eq(menuProductRelated.productId, productId));

  const options = input.pricing.options.map((option, position) => ({
    productId,
    nameEn: option.name?.en ?? null,
    nameAr: option.name?.ar ?? null,
    price: option.price,
    discount: option.discount,
    position,
  }));
  if (options.length) await tx.insert(menuProductOptions).values(options);

  const addOns = input.addOnIds.map((addOnId, position) => ({
    productId,
    addOnId,
    position,
  }));
  if (addOns.length) await tx.insert(menuProductAddOns).values(addOns);

  const baristaWay = input.baristaWayAddOnIds.map((addOnId, position) => ({
    productId,
    addOnId,
    position,
  }));
  if (baristaWay.length)
    await tx.insert(menuProductBaristaWay).values(baristaWay);

  const related = input.oftenOrderedWithIds.map(
    (relatedProductId, position) => ({
      productId,
      relatedProductId,
      position,
    })
  );
  if (related.length) await tx.insert(menuProductRelated).values(related);
}

export async function productUsage(
  tx: Tx,
  id: number
): Promise<{ signatures: number; pairings: number; relatedFrom: number }> {
  const signatures = await countOf(
    tx
      .select({ value: count() })
      .from(menuSignatures)
      .where(eq(menuSignatures.productId, id))
  );
  const pairings = (await pairingIdsContaining(tx, id)).length;
  const relatedFrom = await countOf(
    tx
      .select({ value: count() })
      .from(menuProductRelated)
      .where(eq(menuProductRelated.relatedProductId, id))
  );
  return { signatures, pairings, relatedFrom };
}

export async function signatureProductIds(tx: Tx): Promise<number[]> {
  const rows = await tx
    .select({ productId: menuSignatures.productId })
    .from(menuSignatures)
    .orderBy(asc(menuSignatures.position));
  return rows.map((row) => row.productId);
}

export async function replaceSignatures(
  tx: Tx,
  productIds: number[]
): Promise<void> {
  await tx.delete(menuSignatures);
  if (productIds.length)
    await tx
      .insert(menuSignatures)
      .values(
        productIds.map((productId, position) => ({ position, productId }))
      );
}

export async function pairingIdsContaining(
  tx: Tx,
  productId: number
): Promise<number[]> {
  const rows = await tx
    .selectDistinct({ pairingId: menuPairingItems.pairingId })
    .from(menuPairingItems)
    .where(eq(menuPairingItems.productId, productId));
  return rows.map((row) => row.pairingId);
}

export async function findPairing(tx: Tx, id: number) {
  const [row] = await tx
    .select()
    .from(menuPairings)
    .where(eq(menuPairings.id, id))
    .limit(1);
  return row ?? null;
}

export async function nextPairingPosition(tx: Tx): Promise<number> {
  const [row] = await tx
    .select({ value: sql<number>`coalesce(max(${menuPairings.position}), -1)` })
    .from(menuPairings);
  return Number(row.value) + 1;
}

export async function insertPairing(
  tx: Tx,
  values: { price: number; discount: number; position: number }
): Promise<number> {
  const [row] = await tx
    .insert(menuPairings)
    .values(values)
    .returning({ id: menuPairings.id });
  return row.id;
}

export async function updatePairingRow(
  tx: Tx,
  id: number,
  values: { price: number; discount: number }
): Promise<void> {
  await tx.update(menuPairings).set(values).where(eq(menuPairings.id, id));
}

export async function replacePairingItems(
  tx: Tx,
  pairingId: number,
  productIds: number[]
): Promise<void> {
  await tx
    .delete(menuPairingItems)
    .where(eq(menuPairingItems.pairingId, pairingId));
  await tx
    .insert(menuPairingItems)
    .values(
      productIds.map((productId, position) => ({
        pairingId,
        productId,
        position,
      }))
    );
}

export async function deletePairingRows(tx: Tx, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await tx.delete(menuPairings).where(inArray(menuPairings.id, ids));
}

export async function deletePairingRow(tx: Tx, id: number): Promise<void> {
  await tx.delete(menuPairings).where(eq(menuPairings.id, id));
}

const notFound = () =>
  new AppError("MENU_ITEM_NOT_FOUND", "Menu item not found");

const invalidate = () => menuService.invalidate();

function assertFound(ids: number[], found: number[], what: string): void {
  const known = new Set(found);
  if (ids.some((id) => !known.has(id)))
    throw new AppError("MENU_REFERENCE_NOT_FOUND", `Unknown ${what} id`);
}

async function assertReferences(
  tx: Tx,
  input: AdminProductInput
): Promise<void> {
  if (
    input.categoryId !== null &&
    !(await categoryExists(tx, input.categoryId))
  )
    throw new AppError("MENU_REFERENCE_NOT_FOUND", "Unknown category id");

  const addOnIds = [
    ...new Set([...input.addOnIds, ...input.baristaWayAddOnIds]),
  ];
  assertFound(addOnIds, await addOnIdsIn(tx, addOnIds), "add-on");

  const relatedIds = [...new Set(input.oftenOrderedWithIds)];
  assertFound(relatedIds, await productIdsIn(tx, relatedIds), "product");
}

async function assertProductsExist(tx: Tx, ids: number[]): Promise<void> {
  assertFound(ids, await productIdsIn(tx, ids), "product");
}

export const menuAdminService = {
  async getState(): Promise<AdminMenuState> {
    const rows = await db.transaction((tx) => readAll(tx), READ_ONLY);
    return mapAdminState(rows);
  },

  async updatePopup(input: AdminPopupInput): Promise<void> {
    await db.transaction(async (tx) => {
      const settings = await ensureSettings(tx);
      assertPopup(input.enabled, settings.popupImage !== null);
      await touchSettings(tx, {
        popupEnabled: input.enabled,
        popupDelaySeconds: input.delaySeconds,
      });
    });
    invalidate();
  },

  async replacePopupImage(buffer: Buffer): Promise<void> {
    const file = await storePopupImage(buffer);
    let previous: string | null;
    try {
      previous = await db.transaction(async (tx) => {
        const settings = await ensureSettings(tx);
        await touchSettings(tx, { popupImage: file });
        return settings.popupImage;
      });
    } catch (error) {
      await removePopupImage(file);
      throw error;
    }
    if (previous) await removePopupImage(previous);
    invalidate();
  },

  async replaceSignatures(productIds: number[]): Promise<void> {
    assertDistinct(productIds, "productIds");
    await db.transaction(async (tx) => {
      await assertProductsExist(tx, productIds);
      await replaceSignatures(tx, productIds);
      await touchSettings(tx);
    });
    invalidate();
  },

  async createPairing(input: AdminPairingInput): Promise<number> {
    assertPairing(input.productIds, input.price, input.discount);
    const id = await db.transaction(async (tx) => {
      await assertProductsExist(tx, input.productIds);
      const position = await nextPairingPosition(tx);
      const id = await insertPairing(tx, {
        price: input.price,
        discount: input.discount,
        position,
      });
      await replacePairingItems(tx, id, input.productIds);
      await touchSettings(tx);
      return id;
    });
    invalidate();
    return id;
  },

  async updatePairing(id: number, input: AdminPairingInput): Promise<void> {
    assertPairing(input.productIds, input.price, input.discount);
    await db.transaction(async (tx) => {
      if (!(await findPairing(tx, id))) throw notFound();
      await assertProductsExist(tx, input.productIds);
      await updatePairingRow(tx, id, {
        price: input.price,
        discount: input.discount,
      });
      await replacePairingItems(tx, id, input.productIds);
      await touchSettings(tx);
    });
    invalidate();
  },

  async deletePairing(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      if (!(await findPairing(tx, id))) throw notFound();
      await deletePairingRow(tx, id);
      await touchSettings(tx);
    });
    invalidate();
  },

  async addOnUsage(id: number): Promise<AddOnUsage> {
    return db.transaction(async (tx) => {
      if (!(await findAddOn(tx, id))) throw notFound();
      return addOnUsage(tx, id);
    }, READ_ONLY);
  },

  async createAddOn(input: AdminAddOnInput): Promise<number> {
    const id = await db.transaction(async (tx) => {
      const position = await nextAddOnPosition(tx);
      const id = await insertAddOn(tx, { ...input, position });
      await touchSettings(tx);
      return id;
    });
    invalidate();
    return id;
  },

  async updateAddOn(id: number, input: AdminAddOnInput): Promise<void> {
    await db.transaction(async (tx) => {
      if (!(await findAddOn(tx, id))) throw notFound();
      await updateAddOnRow(tx, id, input);
      await touchSettings(tx);
    });
    invalidate();
  },

  async deleteAddOn(id: number): Promise<AddOnUsage> {
    const usage = await db.transaction(async (tx) => {
      if (!(await findAddOn(tx, id))) throw notFound();
      const usage = await addOnUsage(tx, id);
      await deleteAddOnRow(tx, id);
      await touchSettings(tx);
      return usage;
    });
    invalidate();
    return usage;
  },

  async reorderAddOns(ids: number[]): Promise<void> {
    await db.transaction(async (tx) => {
      assertCompleteOrder(await allAddOnIds(tx), ids);
      await setAddOnPositions(tx, ids);
      await touchSettings(tx);
    });
    invalidate();
  },

  async categoryUsage(id: number): Promise<CategoryUsage> {
    return db.transaction(async (tx) => {
      if (!(await categoryExists(tx, id))) throw notFound();
      return { products: await categoryProductCount(tx, id) };
    }, READ_ONLY);
  },

  async createCategory(input: AdminCategoryInput): Promise<number> {
    const id = await db.transaction(async (tx) => {
      const position = await nextCategoryPosition(tx);
      const id = await insertCategory(tx, input.name, position);
      await touchSettings(tx);
      return id;
    });
    invalidate();
    return id;
  },

  async updateCategory(id: number, input: AdminCategoryInput): Promise<void> {
    await db.transaction(async (tx) => {
      if (!(await categoryExists(tx, id))) throw notFound();
      await updateCategory(tx, id, input.name);
      await touchSettings(tx);
    });
    invalidate();
  },

  async deleteCategory(id: number): Promise<CategoryUsage> {
    const usage = await db.transaction(async (tx) => {
      if (!(await categoryExists(tx, id))) throw notFound();
      const productIds = await productIdsInCategory(tx, id);
      await moveProductsToUncategorized(tx, productIds);
      await deleteCategoryRow(tx, id);
      await setCategoryPositions(tx, await categoryIds(tx));
      await touchSettings(tx);
      return { products: productIds.length };
    });
    invalidate();
    return usage;
  },

  async reorderCategories(ids: number[]): Promise<void> {
    await db.transaction(async (tx) => {
      assertCompleteOrder(await categoryIds(tx), ids);
      await setCategoryPositions(tx, ids);
      await touchSettings(tx);
    });
    invalidate();
  },

  async productUsage(id: number): Promise<ProductUsage> {
    return db.transaction(async (tx) => {
      if (!(await findProduct(tx, id))) throw notFound();
      return productUsage(tx, id);
    }, READ_ONLY);
  },

  async createProduct(
    input: AdminProductInput,
    image: Buffer
  ): Promise<number> {
    assertProductInput(input);
    const file = await storeProductImage(image);
    try {
      const id = await db.transaction(async (tx) => {
        await assertReferences(tx, input);
        const position = await nextProductPosition(tx, input.categoryId);
        const id = await insertProduct(tx, {
          ...toProductColumns(input),
          image: file,
          position,
        });
        await replaceProductChildren(tx, id, input);
        await touchSettings(tx);
        return id;
      });
      invalidate();
      return id;
    } catch (error) {
      await removeProductImage(file);
      throw error;
    }
  },

  async updateProduct(id: number, input: AdminProductInput): Promise<void> {
    assertProductInput(input, id);
    await db.transaction(async (tx) => {
      const current = await findProduct(tx, id);
      if (!current) throw notFound();
      await assertReferences(tx, input);

      const position =
        current.categoryId === input.categoryId
          ? current.position
          : await nextProductPosition(tx, input.categoryId);

      await updateProductRow(tx, id, {
        ...toProductColumns(input),
        position,
      });
      await replaceProductChildren(tx, id, input);
      await touchSettings(tx);
    });
    invalidate();
  },

  async replaceProductImage(id: number, buffer: Buffer): Promise<void> {
    const file = await storeProductImage(buffer);
    let previous: string;
    try {
      previous = await db.transaction(async (tx) => {
        const current = await findProduct(tx, id);
        if (!current) throw notFound();
        await updateProductRow(tx, id, { image: file });
        await touchSettings(tx);
        return current.image;
      });
    } catch (error) {
      await removeProductImage(file);
      throw error;
    }
    await removeProductImage(previous);
    invalidate();
  },

  async deleteProduct(id: number): Promise<ProductUsage> {
    const { usage, image } = await db.transaction(async (tx) => {
      const product = await findProduct(tx, id);
      if (!product) throw notFound();

      const usage = await productUsage(tx, id);
      await deletePairingRows(tx, await pairingIdsContaining(tx, id));
      await deleteProductRow(tx, id);

      await replaceSignatures(tx, await signatureProductIds(tx));
      await touchSettings(tx);
      return { usage, image: product.image };
    });
    await removeProductImage(image);
    invalidate();
    return usage;
  },

  async reorderProducts(
    categoryId: number | null,
    ids: number[]
  ): Promise<void> {
    await db.transaction(async (tx) => {
      if (categoryId !== null && !(await categoryExists(tx, categoryId)))
        throw new AppError("MENU_REFERENCE_NOT_FOUND", "Unknown category id");
      assertCompleteOrder(await productIdsInCategory(tx, categoryId), ids);
      await setProductPositions(tx, ids);
      await touchSettings(tx);
    });
    invalidate();
  },
} as const;
