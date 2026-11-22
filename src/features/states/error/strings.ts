import type { Localized } from "@/shared/i18n";

const en = {
  network: {
    title: "Can't reach the page",
    description: "Check your connection and try again.",
  },
  generic: {
    title: "Something went wrong",
    description: "We couldn't load this page. Please try again.",
  },
  retry: "Try again",
};

const ar: typeof en = {
  network: {
    title: "تعذّر الوصول إلى الصفحة",
    description: "تحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
  },
  generic: {
    title: "حدث خطأ ما",
    description: "تعذّر تحميل الصفحة. حاول مرة أخرى.",
  },
  retry: "حاول مرة أخرى",
};

export const strings: Localized<typeof en> = { en, ar };
