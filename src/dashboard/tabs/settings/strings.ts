import type { Localized } from "@/shared/i18n";

const en = {
  label: "Settings",
  title: "Settings",
  description: "Account and dashboard preferences.",
};

const ar: typeof en = {
  label: "الإعدادات",
  title: "الإعدادات",
  description: "تفضيلات الحساب ولوحة التحكم.",
};

export const strings: Localized<typeof en> = { en, ar };
