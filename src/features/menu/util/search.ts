import type { Locale } from "@/shared/i18n";
import type { MenuDto } from "@api/contracts";

function normalize(value: string, locale: Locale): string {
  return value
    .toLocaleLowerCase(locale)
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchMenu(menu: MenuDto, query: string, locale: Locale) {
  const needle = normalize(query, locale);
  const matches = (fields: (string | undefined)[]) =>
    needle !== "" &&
    fields.some(
      (field) =>
        field !== undefined && normalize(field, locale).includes(needle)
    );

  const categories = menu.categories.filter((category) =>
    matches([category.name?.[locale]])
  );

  const pairings = menu.pairings.filter((pairing) =>
    matches(pairing.items.map((item) => item.name[locale]))
  );

  const products = menu.categories
    .flatMap((category) => category.products)
    .filter((product) =>
      matches([product.name[locale], product.description[locale]])
    );

  return {
    categories,
    pairings,
    products,
    total: categories.length + pairings.length + products.length,
  };
}
