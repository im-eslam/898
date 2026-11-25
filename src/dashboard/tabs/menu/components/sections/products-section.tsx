import { useMemo, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import type { AdminMenuState } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
import { strings } from "../../strings";
import { ProductList } from "./product-list";

const NO_CATEGORY = "none";

const STYLES = {
  wrap: "flex min-w-0 flex-col gap-5",
  filter:
    "flex gap-2 overflow-x-auto overscroll-x-contain p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  pill: CONTROL_STYLES.pill,
} as const;

interface ProductsSectionProps {
  menu: AdminMenuState;
}

// Products are shown one category at a time. The first category is picked by default.
export function ProductsSection({ menu }: ProductsSectionProps) {
  const s = useStrings(strings);
  const categories = useMemo(
    () => [...menu.categories].sort((a, b) => a.position - b.position),
    [menu.categories]
  );

  const [chosenKey, setChosenKey] = useState<string | null>(null);
  const validKeys = [...categories.map((c) => String(c.id)), NO_CATEGORY];
  const firstCategory = categories[0];
  const activeKey =
    chosenKey !== null && validKeys.includes(chosenKey)
      ? chosenKey
      : firstCategory
        ? String(firstCategory.id)
        : NO_CATEGORY;
  const selectedCategoryId = activeKey === NO_CATEGORY ? null : Number(activeKey);

  return (
    <section className={STYLES.wrap}>
      <ToggleButtonGroup
        aria-label={s.products.filterLabel}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[activeKey]}
        onSelectionChange={(keys) => {
          const [key] = keys;
          if (key !== undefined) setChosenKey(String(key));
        }}
        className={STYLES.filter}
      >
        {categories.map((category) => (
          <ToggleButton key={category.id} id={String(category.id)} className={STYLES.pill}>
            {category.name.en}
          </ToggleButton>
        ))}
        <ToggleButton id={NO_CATEGORY} className={STYLES.pill}>
          {s.common.noCategory}
        </ToggleButton>
      </ToggleButtonGroup>

      <ProductList
        key={activeKey}
        products={menu.products}
        categories={categories}
        addOns={menu.addOns}
        selectedCategoryId={selectedCategoryId}
      />
    </section>
  );
}
