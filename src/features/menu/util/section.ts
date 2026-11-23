import type { Locale } from "@/shared/i18n";
import type { MenuCategoryDto, MenuDto } from "@api/contracts";

export const SIGNATURES_ID = "signatures";
export const PAIRINGS_ID = "pairings";

export function categoryId(category: MenuCategoryDto): string {
  return category.id === null ? "category-other" : `category-${category.id}`;
}

export function categoryName(
  category: MenuCategoryDto,
  locale: Locale,
  fallback: string
): string {
  return category.name?.[locale] ?? fallback;
}

export function sectionIds(menu: MenuDto): string[] {
  return [
    ...(menu.signatures.length > 0 ? [SIGNATURES_ID] : []),
    ...(menu.pairings.length > 0 ? [PAIRINGS_ID] : []),
    ...menu.categories.map(categoryId),
  ];
}
