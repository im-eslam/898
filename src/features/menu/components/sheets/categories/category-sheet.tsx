import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuCategoryDto } from "@api/contracts";
import { strings } from "../../../strings";
import { categoryId, categoryName } from "../../../util/section";
import { BaseSheet } from "../base-sheet";

const STYLES = {
  list: "flex flex-col gap-1",
  item: "flex min-h-12 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start outline-none data-focus-visible:-outline-offset-2 data-focus-visible:outline-2 data-focus-visible:outline-brand data-hovered:bg-paper data-pressed:bg-sand/30",
  itemActive: "bg-arctic",
  name: "min-w-0 text-body text-balance",
  nameActive: "font-semibold",
  nameIdle: "font-medium",
  count: "shrink-0 text-caption font-medium tabular-nums text-navy/65",
} as const;

interface CategorySheetProps {
  categories: MenuCategoryDto[];
  activeId: string;
  isOpen: boolean;
  onClose: () => void;
  onPick: (sectionId: string) => void;
}

export function CategorySheet(props: CategorySheetProps) {
  const { categories, categorySheet } = useStrings(strings);
  const locale = useLocale();

  return (
    <BaseSheet
      variant="handle"
      title={categorySheet.title}
      description={categorySheet.description}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <div className={STYLES.list}>
        {props.categories.map((category) => {
          const id = categoryId(category);
          const active = id === props.activeId;

          return (
            <Button
              key={id}
              aria-current={active ? "true" : undefined}
              onPress={() => props.onPick(id)}
              className={`${STYLES.item} ${active ? STYLES.itemActive : ""}`}
            >
              <span
                className={`${STYLES.name} ${active ? STYLES.nameActive : STYLES.nameIdle}`}
              >
                {categoryName(category, locale, categories.uncategorized)}
              </span>
              <span className={STYLES.count}>{category.products.length}</span>
            </Button>
          );
        })}
      </div>
    </BaseSheet>
  );
}
