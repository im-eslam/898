import type { Localized } from "@/shared/i18n";

function arabicItemsCount(count: number): string {
  if (count === 1) return "عنصر واحد";
  if (count === 2) return "عنصران";
  if (count <= 10) return `${count} عناصر`;
  return `${count} عنصرًا`;
}

const en = {
  common: {
    close: "Close",
  },
  page: {
    title: "Menu",
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
  categories: {
    uncategorized: "More",
  },
  products: {
    showAll: (name: string, count: number) => `Show all ${name} (${count})`,
  },
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
    format: (amount: string) => `${amount} EGP`,
    extra: (amount: string) => `+${amount} EGP`,
    from: (amount: string) => `From ${amount}`,
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
  promo: {
    label: "Offer",
  },
  categorySheet: {
    title: "Categories",
    description: "Jump to a section of the menu",
  },
  itemSheet: {
    description: "Item details and options",
    openItem: (name: string) => `Open ${name}`,
    oftenOrdered: "Often ordered with",
    size: "Size",
    baristaWay: "The barista's way",
    baristaSub: "Made the way our barista recommends",
    addOns: "Add-ons",
  },
};

const ar: typeof en = {
  common: {
    close: "إغلاق",
  },
  page: {
    title: "القائمة",
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
  categories: {
    uncategorized: "أخرى",
  },
  products: {
    showAll: (name, count) => `عرض كل ${name} (${count})`,
  },
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
    format: (amount) => `${amount} ج.م`,
    extra: (amount) => `+${amount} ج.م`,
    from: (amount) => `من ${amount}`,
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
  promo: {
    label: "عرض",
  },
  categorySheet: {
    title: "الأقسام",
    description: "انتقل إلى قسم من القائمة",
  },
  itemSheet: {
    description: "تفاصيل الصنف وخياراته",
    openItem: (name) => `افتح ${name}`,
    oftenOrdered: "يُطلب غالبًا مع",
    size: "الحجم",
    baristaWay: "طريقة الباريستا",
    baristaSub: "يُحضّر كما يوصي الباريستا",
    addOns: "إضافات",
  },
};

export const strings: Localized<typeof en> = { en, ar };
