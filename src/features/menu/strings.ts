import type { Localized } from "@/shared/i18n";

function arabicItemsCount(count: number): string {
  if (count === 1) return "عنصر واحد";
  if (count === 2) return "عنصران";
  if (count <= 10) return `${count} عناصر`;
  return `${count} عنصرًا`;
}

const en = {
  carousel: {
    slide: (number: number) => `Go to slide ${number}`,
  },
  badges: {
    top: "Bestseller",
    new: "New",
    outOfStock: "Out of stock",
    savings: (amount: string) => `Save ${amount}`,
  },
  price: {
    currency: "EGP",
    format: (amount: string) => `${amount} EGP`,
    extra: (amount: string) => `+${amount} EGP`,
  },
  sections: {
    signatures: {
      title: "Signatures",
      sub: "Our most loved picks",
    },
    pairings: {
      title: "Pairings",
      sub: "Better together, for less",
    },
  },
  header: {
    back: "Back to home",
    search: "Search the menu",
    categories: "Browse categories",
    language: {
      label: "ع",
      lang: "ar",
      switch: "Switch to Arabic",
    },
  },
  categories: {
    uncategorized: "More",
    showAll: (name: string, count: number) => `Show all ${name} (${count})`,
  },
  search: {
    label: "Search the menu",
    placeholder: "Search drinks, food and offers",
    clear: "Clear search",
    prompt: "Start typing to search the menu",
    noMatch: (query: string) => `No results for "${query}"`,
    itemsCount: (count: number) => `${count} ${count === 1 ? "item" : "items"}`,
    groupCategories: "Categories",
    groupOffers: "Offers",
    groupItems: "Items",
  },
  page: {
    title: "Menu",
  },
  sheet: {
    categories: "Categories",
    categoriesDescription: "Jump to a section of the menu",
    itemDescription: "Item details and options",
    outOfStock: "Out of stock",
    oftenOrdered: "Often ordered with",
    openItem: (name: string) => `Open ${name}`,
    size: "Size",
    baristaWay: "The barista's way",
    baristaSub: "Made the way our barista recommends",
    addOns: "Add-ons",
  },
};

const ar: typeof en = {
  carousel: {
    slide: (number) => `الانتقال إلى الشريحة ${number}`,
  },
  badges: {
    top: "الأكثر مبيعًا",
    new: "جديد",
    outOfStock: "غير متوفر",
    savings: (amount) => `وفّر ${amount}`,
  },
  price: {
    currency: "ج.م",
    format: (amount) => `${amount} ج.م`,
    extra: (amount) => `+${amount} ج.م`,
  },
  sections: {
    signatures: {
      title: "اختياراتنا المميزة",
      sub: "الأكثر حبًا لدى ضيوفنا",
    },
    pairings: {
      title: "ثنائياتنا",
      sub: "أطيب معًا وبسعر أقل",
    },
  },
  header: {
    back: "رجوع للرئيسية",
    search: "ابحث في القائمة",
    categories: "تصفح الأقسام",
    language: {
      label: "En",
      lang: "en",
      switch: "التبديل إلى الإنجليزية",
    },
  },
  categories: {
    uncategorized: "أخرى",
    showAll: (name, count) => `عرض كل ${name} (${count})`,
  },
  search: {
    label: "ابحث في القائمة",
    placeholder: "ابحث عن مشروب أو طعام أو عرض",
    clear: "مسح البحث",
    prompt: "ابدأ الكتابة للبحث في القائمة",
    noMatch: (query) => `لا نتائج لـ "${query}"`,
    itemsCount: arabicItemsCount,
    groupCategories: "الأقسام",
    groupOffers: "العروض",
    groupItems: "الأصناف",
  },
  page: {
    title: "القائمة",
  },
  sheet: {
    categories: "الأقسام",
    categoriesDescription: "انتقل إلى قسم من القائمة",
    itemDescription: "تفاصيل الصنف وخياراته",
    outOfStock: "غير متوفر",
    oftenOrdered: "يُطلب غالبًا مع",
    openItem: (name) => `افتح ${name}`,
    size: "الحجم",
    baristaWay: "طريقة الباريستا",
    baristaSub: "يُحضّر كما يوصي الباريستا",
    addOns: "إضافات",
  },
};

export const strings: Localized<typeof en> = { en, ar };
