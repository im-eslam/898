import type { Locale } from "@/shared/i18n";
import { strings } from "../strings";

const formatters = new Map<Locale, Intl.NumberFormat>();

function formatNumber(amount: number, locale: Locale): string {
  let formatter = formatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      numberingSystem: "latn",
    });
    formatters.set(locale, formatter);
  }
  return formatter.format(Math.round(amount));
}

export function formatPrice(amount: number, locale: Locale): string {
  return strings[locale].price.format(formatNumber(amount, locale));
}

export function formatExtra(amount: number, locale: Locale): string {
  return strings[locale].price.extra(formatNumber(amount, locale));
}

export function formatFrom(amount: number, locale: Locale): string {
  return strings[locale].price.from(formatPrice(amount, locale));
}

export function formatSavings(amount: number, locale: Locale): string {
  return strings[locale].badges.savings(formatPrice(amount, locale));
}
