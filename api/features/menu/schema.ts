import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ---- Menu enums ---------------------------------------------------------

export const currencyEnum = pgEnum("menu_currency", ["EGP"]);
export const badgeEnum = pgEnum("menu_badge", ["top", "new"]);
export const availabilityEnum = pgEnum("menu_availability", [
  "in_stock",
  "out_of_stock",
]);
export const pricingTypeEnum = pgEnum("menu_pricing_type", ["single", "multiple"]);

// ---- Menu tables --------------------------------------------------------

export const menuSettings = pgTable("menu_settings", {
  currency: currencyEnum("currency").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  popupEnabled: boolean("popup_enabled").notNull().default(false),
  popupImage: varchar("popup_image", { length: 255 }),
  popupDelaySeconds: integer("popup_delay_seconds").notNull().default(1),
});

export const menuAddOns = pgTable("menu_add_ons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  price: integer().notNull(),
  position: integer().notNull(),
});

export const menuCategories = pgTable("menu_categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  position: integer().notNull(),
});

export const menuProducts = pgTable(
  "menu_products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer("category_id").references(() => menuCategories.id, {
      onDelete: "set null",
    }),
    nameEn: varchar("name_en", { length: 120 }).notNull(),
    nameAr: varchar("name_ar", { length: 120 }).notNull(),
    descriptionEn: text("description_en").notNull(),
    descriptionAr: text("description_ar").notNull(),
    image: varchar({ length: 255 }).notNull(),
    availability: availabilityEnum("availability").notNull(),
    badge: badgeEnum("badge"),
    pricingType: pricingTypeEnum("pricing_type").notNull(),
    position: integer().notNull(),
  },
  (table) => [
    index("idx_menu_products_category_position").on(
      table.categoryId,
      table.position
    ),
  ]
);

export const menuProductOptions = pgTable(
  "menu_product_options",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => menuProducts.id, { onDelete: "cascade" }),
    nameEn: varchar("name_en", { length: 120 }),
    nameAr: varchar("name_ar", { length: 120 }),
    price: integer().notNull(),
    discount: integer().notNull().default(0),
    position: integer().notNull(),
  },
  (table) => [
    index("idx_menu_product_options_product_position").on(
      table.productId,
      table.position
    ),
  ]
);

export const menuProductAddOns = pgTable(
  "menu_product_add_ons",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => menuProducts.id, { onDelete: "cascade" }),
    addOnId: integer("add_on_id")
      .notNull()
      .references(() => menuAddOns.id, { onDelete: "cascade" }),
    position: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.addOnId] })]
);

export const menuProductBaristaWay = pgTable(
  "menu_product_barista_way",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => menuProducts.id, { onDelete: "cascade" }),
    addOnId: integer("add_on_id")
      .notNull()
      .references(() => menuAddOns.id, { onDelete: "cascade" }),
    position: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.addOnId] })]
);

export const menuProductRelated = pgTable(
  "menu_product_related",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => menuProducts.id, { onDelete: "cascade" }),
    relatedProductId: integer("related_product_id")
      .notNull()
      .references(() => menuProducts.id, { onDelete: "cascade" }),
    position: integer().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.relatedProductId] }),
  ]
);

export const menuSignatures = pgTable("menu_signatures", {
  position: integer().primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => menuProducts.id, { onDelete: "cascade" }),
});

export const menuPairings = pgTable("menu_pairings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  price: integer().notNull(),
  discount: integer().notNull().default(0),
  position: integer().notNull(),
});

export const menuPairingItems = pgTable(
  "menu_pairing_items",
  {
    pairingId: integer("pairing_id")
      .notNull()
      .references(() => menuPairings.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => menuProducts.id, { onDelete: "cascade" }),
    position: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.pairingId, table.position] })]
);

export const menuSchema = {
  settings: menuSettings,
  addOns: menuAddOns,
  categories: menuCategories,
  products: menuProducts,
  productOptions: menuProductOptions,
  productAddOns: menuProductAddOns,
  productBaristaWay: menuProductBaristaWay,
  productRelated: menuProductRelated,
  signatures: menuSignatures,
  pairings: menuPairings,
  pairingItems: menuPairingItems,
} as const;

// Relations let the query API load a menu's nested shape in one query.
export const menuRelations = {
  menuCategoriesRelations: relations(menuCategories, ({ many }) => ({
    products: many(menuProducts),
  })),

  menuProductsRelations: relations(menuProducts, ({ one, many }) => ({
    category: one(menuCategories, {
      fields: [menuProducts.categoryId],
      references: [menuCategories.id],
    }),
    options: many(menuProductOptions),
    addOnLinks: many(menuProductAddOns),
    baristaLinks: many(menuProductBaristaWay),
    relatedLinks: many(menuProductRelated, { relationName: "product_related_from" }),
  })),

  menuProductOptionsRelations: relations(menuProductOptions, ({ one }) => ({
    product: one(menuProducts, {
      fields: [menuProductOptions.productId],
      references: [menuProducts.id],
    }),
  })),

  menuProductAddOnsRelations: relations(menuProductAddOns, ({ one }) => ({
    product: one(menuProducts, {
      fields: [menuProductAddOns.productId],
      references: [menuProducts.id],
    }),
    addOn: one(menuAddOns, {
      fields: [menuProductAddOns.addOnId],
      references: [menuAddOns.id],
    }),
  })),

  menuProductBaristaWayRelations: relations(menuProductBaristaWay, ({ one }) => ({
    product: one(menuProducts, {
      fields: [menuProductBaristaWay.productId],
      references: [menuProducts.id],
    }),
    addOn: one(menuAddOns, {
      fields: [menuProductBaristaWay.addOnId],
      references: [menuAddOns.id],
    }),
  })),

  menuProductRelatedRelations: relations(menuProductRelated, ({ one }) => ({
    product: one(menuProducts, {
      fields: [menuProductRelated.productId],
      references: [menuProducts.id],
      relationName: "product_related_from",
    }),
    relatedProduct: one(menuProducts, {
      fields: [menuProductRelated.relatedProductId],
      references: [menuProducts.id],
      relationName: "product_related_to",
    }),
  })),

  menuSignaturesRelations: relations(menuSignatures, ({ one }) => ({
    product: one(menuProducts, {
      fields: [menuSignatures.productId],
      references: [menuProducts.id],
    }),
  })),

  menuPairingsRelations: relations(menuPairings, ({ many }) => ({
    items: many(menuPairingItems),
  })),

  menuPairingItemsRelations: relations(menuPairingItems, ({ one }) => ({
    pairing: one(menuPairings, {
      fields: [menuPairingItems.pairingId],
      references: [menuPairings.id],
    }),
    product: one(menuProducts, {
      fields: [menuPairingItems.productId],
      references: [menuProducts.id],
    }),
  })),
} as const;
