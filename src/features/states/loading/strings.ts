import type { Localized } from "@/shared/i18n";

const en = {
  label: "Loading",
};

const ar: typeof en = {
  label: "جارٍ التحميل",
};

export const strings: Localized<typeof en> = { en, ar };
