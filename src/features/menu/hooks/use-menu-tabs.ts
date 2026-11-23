import { useMemo } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuDto } from "@api/contracts";
import type { HeaderTab } from "../components/header/header";
import { strings } from "../strings";
import {
  PAIRINGS_ID,
  SIGNATURES_ID,
  categoryId,
  categoryName,
} from "../util/section";

export function useMenuTabs(menu: MenuDto): HeaderTab[] {
  const { sections, categories } = useStrings(strings);
  const locale = useLocale();

  return useMemo(
    () => [
      ...(menu.signatures.length > 0
        ? [{ id: SIGNATURES_ID, label: sections.signatures.title }]
        : []),
      ...(menu.pairings.length > 0
        ? [{ id: PAIRINGS_ID, label: sections.pairings.title }]
        : []),
      ...menu.categories.map((category) => ({
        id: categoryId(category),
        label: categoryName(category, locale, categories.uncategorized),
      })),
    ],
    [menu, locale, sections, categories]
  );
}
