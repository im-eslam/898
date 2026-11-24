import type { Locale } from "@/shared/i18n";

const formatters: Partial<Record<Locale, Intl.DateTimeFormat>> = {};

export function formatCreatedAt(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  formatters[locale] ??= new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-GB",
    { dateStyle: "medium", timeStyle: "short" }
  );
  return formatters[locale]!.format(date);
}
