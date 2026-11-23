import { readFileSync } from "node:fs";
import { db } from "../config.js";
import type {
  LocalizedText,
  MenuAddOnDto,
  MenuCategoryDto,
  MenuDto,
  MenuPairingDto,
  MenuPriceOptionDto,
  MenuPricingType,
  MenuProductDto,
} from "../contracts.js";
import { menuSchema as t } from "../features/menu/schema.js";
type Code = string;

type SeedAddOn = Omit<MenuAddOnDto, "id">;

type SeedOption = Omit<MenuPriceOptionDto, "id"> & { id: Code };

type SeedProduct = Omit<
  MenuProductDto,
  "id" | "pricing" | "addOns" | "baristaWay" | "oftenOrderedWith"
> & {
  id: Code;
  pricing: { type: MenuPricingType; options: SeedOption[] };
  addOns: Code[];
  baristaWay: Code[];
  oftenOrderedWith: Code[];
};

type SeedCategory = Omit<MenuCategoryDto, "id" | "name" | "products"> & {
  id: Code;
  name: LocalizedText;
  products: SeedProduct[];
};

type SeedPairing = Omit<MenuPairingDto, "id" | "items"> & {
  id: Code;
  items: Code[];
};

type SeedMenu = Omit<
  MenuDto,
  "badges" | "categories" | "signatures" | "pairings"
> & {
  addOns: Record<Code, SeedAddOn>;
  categories: SeedCategory[];
  signatures: Code[];
  pairings: SeedPairing[];
};

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

function readMenu(path: string): SeedMenu {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as SeedMenu;
  } catch (error) {
    die(
      `Could not read ${path}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function resolve(map: Map<Code, number>, code: Code, what: string): number {
  const id = map.get(code);
  if (id === undefined) throw new Error(`Unknown ${what} code "${code}"`);
  return id;
}

const path = process.argv[2];
if (!path) die("Usage: npm run api:seed-menu -- <path-to-menu.json>");

const menu = readMenu(path);
const allProducts = menu.categories.flatMap((c) => c.products);

for (const product of allProducts) {
  const { type, options } = product.pricing;
  if (type === "single" && options.length !== 1)
    die(`Product ${product.id}: "single" pricing needs exactly one option`);
  if (type === "multiple" && options.some((o) => !o.name))
    die(
      `Product ${product.id}: "multiple" pricing needs a name on every option`
    );
  for (const o of options)
    if (o.final !== o.price - o.discount)
      die(`Option ${o.id} of ${product.id}: final != price - discount`);
}
for (const pairing of menu.pairings)
  if (
    pairing.pricing.final !==
    pairing.pricing.price - pairing.pricing.discount
  )
    die(`Pairing ${pairing.id}: final != price - discount`);

async function seed() {
  await db.transaction(async (tx) => {
    await tx.delete(t.pairingItems);
    await tx.delete(t.pairings);
    await tx.delete(t.signatures);
    await tx.delete(t.productRelated);
    await tx.delete(t.productBaristaWay);
    await tx.delete(t.productAddOns);
    await tx.delete(t.productOptions);
    await tx.delete(t.products);
    await tx.delete(t.categories);
    await tx.delete(t.addOns);
    await tx.delete(t.settings);

    await tx.insert(t.settings).values({
      currency: menu.currency,
      updatedAt: new Date(menu.updatedAt),
      popupEnabled: menu.popup.enabled,
      popupImage: menu.popup.image,
      popupDelaySeconds: menu.popup.delaySeconds,
    });

    const addOnIds = new Map<Code, number>();
    let addOnPosition = 0;
    for (const [code, a] of Object.entries(menu.addOns)) {
      const [row] = await tx
        .insert(t.addOns)
        .values({
          nameEn: a.name.en,
          nameAr: a.name.ar,
          price: a.price,
          position: addOnPosition++,
        })
        .returning({ id: t.addOns.id });
      addOnIds.set(code, row.id);
    }

    const productIds = new Map<Code, number>();
    const productRows: { dbId: number; product: SeedProduct }[] = [];
    let categoryPosition = 0;
    for (const category of menu.categories) {
      const [cat] = await tx
        .insert(t.categories)
        .values({
          nameEn: category.name.en,
          nameAr: category.name.ar,
          position: categoryPosition++,
        })
        .returning({ id: t.categories.id });

      let productPosition = 0;
      for (const p of category.products) {
        const [row] = await tx
          .insert(t.products)
          .values({
            categoryId: cat.id,
            nameEn: p.name.en,
            nameAr: p.name.ar,
            descriptionEn: p.description.en,
            descriptionAr: p.description.ar,
            image: p.image,
            availability: p.availability,
            badge: p.badge,
            pricingType: p.pricing.type,
            position: productPosition++,
          })
          .returning({ id: t.products.id });
        productIds.set(p.id, row.id);
        productRows.push({ dbId: row.id, product: p });
      }
    }

    const optionRows = productRows.flatMap(({ dbId, product }) =>
      product.pricing.options.map((o, position) => ({
        productId: dbId,
        nameEn: o.name?.en ?? null,
        nameAr: o.name?.ar ?? null,
        price: o.price,
        discount: o.discount,
        position,
      }))
    );
    if (optionRows.length) await tx.insert(t.productOptions).values(optionRows);

    const productAddOnRows = productRows.flatMap(({ dbId, product }) =>
      product.addOns.map((code, position) => ({
        productId: dbId,
        addOnId: resolve(addOnIds, code, "add-on"),
        position,
      }))
    );
    if (productAddOnRows.length)
      await tx.insert(t.productAddOns).values(productAddOnRows);

    const baristaWayRows = productRows.flatMap(({ dbId, product }) =>
      product.baristaWay.map((code, position) => ({
        productId: dbId,
        addOnId: resolve(addOnIds, code, "add-on"),
        position,
      }))
    );
    if (baristaWayRows.length)
      await tx.insert(t.productBaristaWay).values(baristaWayRows);

    const relatedRows = productRows.flatMap(({ dbId, product }) =>
      product.oftenOrderedWith.map((code, position) => ({
        productId: dbId,
        relatedProductId: resolve(productIds, code, "product"),
        position,
      }))
    );
    if (relatedRows.length)
      await tx.insert(t.productRelated).values(relatedRows);

    const signatureRows = menu.signatures.map((code, position) => ({
      position,
      productId: resolve(productIds, code, "product"),
    }));
    if (signatureRows.length)
      await tx.insert(t.signatures).values(signatureRows);

    let pairingPosition = 0;
    for (const pairing of menu.pairings) {
      const [row] = await tx
        .insert(t.pairings)
        .values({
          price: pairing.pricing.price,
          discount: pairing.pricing.discount,
          position: pairingPosition++,
        })
        .returning({ id: t.pairings.id });

      const items = pairing.items.map((code, position) => ({
        pairingId: row.id,
        productId: resolve(productIds, code, "product"),
        position,
      }));
      if (items.length) await tx.insert(t.pairingItems).values(items);
    }
  });

  console.info(
    `Menu seeded: ${menu.categories.length} categories, ${allProducts.length} products, ${menu.pairings.length} pairings, ${Object.keys(menu.addOns).length} add-ons.`
  );
}

try {
  await seed();
  process.exit(0);
} catch (error) {
  die(error instanceof Error ? error.message : "Seeding failed.");
}
