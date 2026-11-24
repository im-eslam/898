import type { Localized } from "@/shared/i18n";

const en = {
  label: "Reviews",
  title: "Reviews",
  description: "Customer feedback will show up here.",
};

const ar: typeof en = {
  label: "التقييمات",
  title: "التقييمات",
  description: "ستظهر ملاحظات العملاء هنا.",
};

export const strings: Localized<typeof en> = { en, ar };
