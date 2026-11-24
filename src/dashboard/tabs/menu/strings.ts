import type { Localized } from "@/shared/i18n";

const en = {
  label: "Menu",
  title: "Menu",
  description: "Edit products, prices and categories.",
};

const ar: typeof en = {
  label: "القائمة",
  title: "القائمة",
  description: "عدّل المنتجات والأسعار والفئات.",
};

export const strings: Localized<typeof en> = { en, ar };
