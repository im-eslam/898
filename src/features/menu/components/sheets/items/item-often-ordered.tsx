import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuProductRefDto } from "@api/contracts";
import { strings } from "../../../strings";
import { Stock } from "../../../util/menu";
import { Chevron } from "../../ui/chevron";
import { Price } from "../../ui/price";
import { ProductImage } from "../../ui/product-image";

interface ItemOftenOrderedProps {
  references: MenuProductRefDto[];
  onOpen: (productId: number) => void;
}

const STYLES = {
  root: "flex flex-col gap-2",
  title: "text-body font-bold",
  rail: "-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-6 md:px-6",
  card: "relative flex w-28 shrink-0 select-none [-webkit-user-select:none] [-webkit-touch-callout:none] touch-manipulation flex-col gap-1 rounded-md border border-arctic bg-white p-2 text-start",
  image: "h-16 w-full rounded-md",
  name: "line-clamp-2 min-h-[2lh] text-caption font-medium text-balance",
  nameUnavailable: "text-navy/60",
  footer: "flex items-center justify-between gap-1",
  action:
    "absolute inset-0 z-10 rounded-md outline-none active:transform-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-brand",
} as const;

export function ItemOftenOrdered(props: ItemOftenOrderedProps) {
  const { itemSheet } = useStrings(strings);
  const locale = useLocale();

  return (
    <section aria-label={itemSheet.oftenOrdered} className={STYLES.root}>
      <h3 className={STYLES.title}>{itemSheet.oftenOrdered}</h3>
      <div className={STYLES.rail}>
        {props.references.map((ref) => {
          const available = Stock.isAvailable(ref);
          const name = ref.name[locale];

          return (
            <div key={ref.id} className={STYLES.card}>
              <ProductImage
                image={ref.image}
                kind="thumb"
                grayscale={!available}
                className={STYLES.image}
              />
              <span
                className={`${STYLES.name} ${available ? "" : STYLES.nameUnavailable}`}
              >
                {name}
              </span>
              <span className={STYLES.footer}>
                {ref.price && (
                  <Price
                    original={ref.price.price}
                    discounted={ref.price.final}
                    size="caption"
                  />
                )}
                <Chevron size="s" />
              </span>
              <Button
                aria-label={itemSheet.openItem(name)}
                onPress={() => props.onOpen(ref.id)}
                className={STYLES.action}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
