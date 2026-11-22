import type { Localized } from "@/shared/i18n";

const en = {
  label: "Loading",
  menu: {
    title: "Brewing your coffee",
    description: "Getting the menu ready for you",
  },
};

const ar: typeof en = {
  label: "جارٍ التحميل",
  menu: {
    title: "جارٍ تحضير قهوتك",
    description: "نجهّز القائمة من أجلك",
  },
};

export const strings: Localized<typeof en> = { en, ar };
