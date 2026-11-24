import type { Localized } from "@/shared/i18n";

const en = {
  brand: "Admin",
  navLabel: "Dashboard sections",
  signOut: "Sign out",
};

const ar: typeof en = {
  brand: "الإدارة",
  navLabel: "أقسام لوحة التحكم",
  signOut: "تسجيل الخروج",
};

export const strings: Localized<typeof en> = { en, ar };
