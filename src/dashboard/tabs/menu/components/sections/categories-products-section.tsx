import { useEffect, useMemo, useState } from "react";
import { Button } from "react-aria-components";
import type { AdminMenuState } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { CategoryList } from "./category-list";
import { ProductList } from "./product-list";

interface CategoriesProductsSectionProps {
  menu: AdminMenuState;
}

const NO_CATEGORY_KEY = "none";

const STYLES = {
  wrap: "flex flex-col gap-8",
  divider: "h-px bg-navy/10",
  pills: "flex flex-wrap gap-2",
  pill:
    "inline-flex h-9 items-center rounded-full border border-navy/15 bg-white px-4 text-small font-bold text-navy/70 transition-colors ease-smooth outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-[active=true]:border-brand data-[active=true]:bg-brand data-[active=true]:text-white",
} as const;

export function CategoriesProductsSection({ menu }: CategoriesProductsSectionProps) {
  const s = useStrings(strings);
  const sortedCategories = useMemo(
    () => [...menu.categories].sort((a, b) => a.position - b.position),
    [menu.categories]
  );

  const [selectedKey, setSelectedKey] = useState<string>(
    sortedCategories[0] ? String(sortedCategories[0].id) : NO_CATEGORY_KEY
  );

  useEffect(() => {
    if (selectedKey === NO_CATEGORY_KEY) return;
    const stillExists = sortedCategories.some(
      (category) => String(category.id) === selectedKey
    );
    if (!stillExists) {
      setSelectedKey(
        sortedCategories[0] ? String(sortedCategories[0].id) : NO_CATEGORY_KEY
      );
    }
  }, [sortedCategories, selectedKey]);

  const selectedCategoryId =
    selectedKey === NO_CATEGORY_KEY ? null : Number(selectedKey);

  return (
    <div className={STYLES.wrap}>
      <CategoryList categories={menu.categories} />

      <div className={STYLES.divider} />

      <div className="flex flex-col gap-3">
        <div className={STYLES.pills} role="tablist" aria-label={s.products.title}>
          {sortedCategories.map((category) => (
            <Button
              key={category.id}
              data-active={selectedKey === String(category.id)}
              onPress={() => setSelectedKey(String(category.id))}
              className={STYLES.pill}
            >
              {category.name.en}
            </Button>
          ))}
          <Button
            data-active={selectedKey === NO_CATEGORY_KEY}
            onPress={() => setSelectedKey(NO_CATEGORY_KEY)}
            className={STYLES.pill}
          >
            {s.common.noCategory}
          </Button>
        </div>

        <ProductList
          products={menu.products}
          categories={menu.categories}
          addOns={menu.addOns}
          selectedCategoryId={selectedCategoryId}
        />
      </div>
    </div>
  );
}
