import { useSyncExternalStore } from "react";
import { STORAGE_KEY, type Locale, type Localized } from "./data";

class Helpers {
  static current: Locale = "en";
  static listeners = new Set<() => void>();

  static {
    if (typeof window !== "undefined") {
      Helpers.current = Helpers.resolveInitial();
      Helpers.applyToDOM(Helpers.current);
    }
  }

  static applyToDOM(locale: Locale): void {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }

  static resolveInitial(): Locale {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ar") return saved;
    } catch {
      void 0;
    }

    return navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en";
  }

  static subscribe(listener: () => void): () => void {
    Helpers.listeners.add(listener);
    return () => {
      Helpers.listeners.delete(listener);
    };
  }
}

function getLocale(): Locale {
  return Helpers.current;
}

function setLocale(locale: Locale): void {
  if (Helpers.current === locale && document.documentElement.lang === locale) {
    return;
  }

  Helpers.current = locale;
  Helpers.applyToDOM(locale);

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    void 0;
  }

  Helpers.listeners.forEach((listener) => listener());
}

function useLocale(): Locale {
  return useSyncExternalStore(Helpers.subscribe, getLocale);
}

function useStrings<T>(table: Localized<T>): T {
  return table[useLocale()];
}

export {
  type Locale,
  type Localized,
  getLocale,
  setLocale,
  useLocale,
  useStrings,
};
