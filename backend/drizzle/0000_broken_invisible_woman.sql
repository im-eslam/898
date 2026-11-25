CREATE TYPE "public"."menu_availability" AS ENUM('in_stock', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."menu_badge" AS ENUM('top', 'new');--> statement-breakpoint
CREATE TYPE "public"."menu_currency" AS ENUM('EGP');--> statement-breakpoint
CREATE TYPE "public"."menu_pricing_type" AS ENUM('single', 'multiple');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"language" varchar(5) DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "menu_add_ons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_add_ons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name_en" varchar(120) NOT NULL,
	"name_ar" varchar(120) NOT NULL,
	"price" integer NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name_en" varchar(120) NOT NULL,
	"name_ar" varchar(120) NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_pairing_items" (
	"pairing_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "menu_pairing_items_pairing_id_position_pk" PRIMARY KEY("pairing_id","position")
);
--> statement-breakpoint
CREATE TABLE "menu_pairings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_pairings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"price" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_product_add_ons" (
	"product_id" integer NOT NULL,
	"add_on_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "menu_product_add_ons_product_id_add_on_id_pk" PRIMARY KEY("product_id","add_on_id")
);
--> statement-breakpoint
CREATE TABLE "menu_product_barista_way" (
	"product_id" integer NOT NULL,
	"add_on_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "menu_product_barista_way_product_id_add_on_id_pk" PRIMARY KEY("product_id","add_on_id")
);
--> statement-breakpoint
CREATE TABLE "menu_product_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_product_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"name_en" varchar(120),
	"name_ar" varchar(120),
	"price" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_product_related" (
	"product_id" integer NOT NULL,
	"related_product_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "menu_product_related_product_id_related_product_id_pk" PRIMARY KEY("product_id","related_product_id")
);
--> statement-breakpoint
CREATE TABLE "menu_products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_id" integer,
	"name_en" varchar(120) NOT NULL,
	"name_ar" varchar(120) NOT NULL,
	"description_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"image" varchar(255) NOT NULL,
	"availability" "menu_availability" NOT NULL,
	"badge" "menu_badge",
	"pricing_type" "menu_pricing_type" NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_settings" (
	"currency" "menu_currency" NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"popup_enabled" boolean DEFAULT false NOT NULL,
	"popup_image" varchar(255),
	"popup_delay_seconds" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_signatures" (
	"position" integer PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(80) DEFAULT '' NOT NULL,
	"contact" varchar(120) DEFAULT '' NOT NULL,
	"message" varchar(1000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_pairing_items" ADD CONSTRAINT "menu_pairing_items_pairing_id_menu_pairings_id_fk" FOREIGN KEY ("pairing_id") REFERENCES "public"."menu_pairings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_pairing_items" ADD CONSTRAINT "menu_pairing_items_product_id_menu_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_add_ons" ADD CONSTRAINT "menu_product_add_ons_product_id_menu_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_add_ons" ADD CONSTRAINT "menu_product_add_ons_add_on_id_menu_add_ons_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."menu_add_ons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_barista_way" ADD CONSTRAINT "menu_product_barista_way_product_id_menu_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_barista_way" ADD CONSTRAINT "menu_product_barista_way_add_on_id_menu_add_ons_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."menu_add_ons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_options" ADD CONSTRAINT "menu_product_options_product_id_menu_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_related" ADD CONSTRAINT "menu_product_related_product_id_menu_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_product_related" ADD CONSTRAINT "menu_product_related_related_product_id_menu_products_id_fk" FOREIGN KEY ("related_product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_products" ADD CONSTRAINT "menu_products_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_signatures" ADD CONSTRAINT "menu_signatures_product_id_menu_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_menu_product_options_product_position" ON "menu_product_options" USING btree ("product_id","position");--> statement-breakpoint
CREATE INDEX "idx_menu_products_category_position" ON "menu_products" USING btree ("category_id","position");--> statement-breakpoint
CREATE INDEX "idx_reviews_created_at_id" ON "reviews" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);