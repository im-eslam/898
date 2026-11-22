import type { Localized } from "@/shared/i18n";

const en = {
  header: {
    brandName: "898 Coffee",
    taglineLead: "Good Coffee",
    taglineEmphasis: "Better Days.",
  },
  language: {
    name: "عربي",
    switchTo: "Switch language to Arabic",
  },
  footer: {
    lead: "Every visit tells",
    emphasis: "a story.",
    copyright: "© {year} 898 Coffee.",
  },
  sections: {
    primary: {
      menu: { title: "Menu", hint: "Drinks, desserts & offers" },
      review: { title: "Rate your visit", hint: "Shape your next sip" },
    },
    social: {
      heading: "Follow the story",
      title: "Instagram",
      hint: "@898coffee",
    },
    location: {
      heading: "Find your seat",
      title: "Main branch",
    },
  },
};

const ar: typeof en = {
  header: {
    brandName: "898 Coffee",
    taglineLead: "قهوه حلوة",
    taglineEmphasis: "أيام أحلى.",
  },
  language: {
    name: "English",
    switchTo: "تبديل اللغة إلى الإنجليزية",
  },
  footer: {
    lead: "كل قعدة ليها",
    emphasis: "حكاية.",
    copyright: "© {year} 898 Coffee.",
  },
  sections: {
    primary: {
      menu: { title: "القائمة", hint: "مشروبات، حلويات وعروض" },
      review: { title: "قيّم زيارتك", hint: "رأيك بيحدد فنجانك الجاي" },
    },
    social: {
      heading: "تابع الحكاية",
      title: "Instagram",
      hint: "@898coffee",
    },
    location: {
      heading: "لاقي قعدتك",
      title: "الفرع الرئيسي",
    },
  },
};

export const strings: Localized<typeof en> = { en, ar };
