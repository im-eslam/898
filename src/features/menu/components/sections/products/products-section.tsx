import { useState } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuCategoryDto, MenuProductDto } from "@api/contracts";
import { strings } from "../../../strings";
import {
  CATEGORY_PREVIEW_COUNT,
  REVEAL_MAX_STEPS,
  REVEAL_STEP_MS,
} from "../../../data";
import { categoryId, categoryName } from "../../../util/section";
import { SectionHeading } from "../../ui/section-heading";
import { ProductCard } from "./product-card";

interface ProductsSectionProps {
  category: MenuCategoryDto;
  onOpen: (product: MenuProductDto) => void;
}

const STYLES = {
  section: "scroll-mt-28 py-6",
  inner: "mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 md:px-6",
  grid: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3",
  reveal: "animate-reveal-in motion-reduce:animate-none",
  showAll:
    "duration-base inline-flex h-12 items-center justify-center rounded-full border border-brand px-4 text-small font-semibold text-brand transition-colors ease-smooth outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-hovered:bg-brand/5 data-pressed:bg-brand/10 md:col-span-full md:mx-auto md:min-w-72",
} as const;

export function ProductsSection(props: ProductsSectionProps) {
  const { categories, products } = useStrings(strings);
  const locale = useLocale();

  const id = categoryId(props.category);
  const title = categoryName(props.category, locale, categories.uncategorized);
  const [showAll, setShowAll] = useState(false);

  const preview = props.category.products.slice(0, CATEGORY_PREVIEW_COUNT);
  const rest = props.category.products.slice(CATEGORY_PREVIEW_COUNT);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={STYLES.section}>
      <div className={STYLES.inner}>
        <SectionHeading id={`${id}-title`} title={title} />

        <div className={STYLES.grid}>
          {preview.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => props.onOpen(product)}
            />
          ))}

          {showAll &&
            rest.map((product, index) => (
              <div
                key={product.id}
                className={STYLES.reveal}
                style={{
                  animationDelay: `${Math.min(index, REVEAL_MAX_STEPS) * REVEAL_STEP_MS}ms`,
                }}
              >
                <ProductCard
                  product={product}
                  onOpen={() => props.onOpen(product)}
                />
              </div>
            ))}

          {!showAll && rest.length > 0 && (
            <Button onPress={() => setShowAll(true)} className={STYLES.showAll}>
              {products.showAll(title, props.category.products.length)}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
