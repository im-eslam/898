import { Button } from "react-aria-components";
import { useLocale } from "@/shared/i18n";
import type { MenuProductDto } from "@api/contracts";
import { MenuLookup, Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { Chevron } from "../../ui/chevron";
import { Price } from "../../ui/price";
import { ProductImage } from "../../ui/product-image";

interface ProductCardProps {
  product: MenuProductDto;
  onOpen: () => void;
}

const STYLES = {
  root: "duration-fast relative flex h-full gap-3 rounded-lg bg-paper p-3 ring-1 ring-sand/40 transition-transform ease-smooth has-data-pressed:scale-[0.96] motion-reduce:transition-none",
  image: "size-24 shrink-0 rounded-md",
  body: "flex min-w-0 flex-1 flex-col gap-0.5",
  name: "line-clamp-2 text-body font-semibold text-balance text-charcoal",
  description: "line-clamp-2 text-caption font-medium text-navy/65",
  footer: "mt-auto flex items-center justify-between gap-2 pt-1",
  unavailable: "opacity-60",
  badge: "absolute end-4 -top-2.5",
  action:
    "absolute inset-0 z-10 rounded-lg outline-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-brand",
} as const;

export function ProductCard(props: ProductCardProps) {
  const locale = useLocale();

  const name = props.product.name[locale];
  const description = props.product.description[locale];
  const available = Stock.isAvailable(props.product);
  const badge = Stock.badgeFor(props.product);
  const option = MenuLookup.startingOption(props.product);

  return (
    <div className={STYLES.root}>
      <ProductImage
        image={props.product.image}
        kind="thumb"
        grayscale={!available}
        className={STYLES.image}
      />

      <div className={STYLES.body}>
        <span className={STYLES.name}>{name}</span>
        {description && (
          <span className={STYLES.description}>{description}</span>
        )}
        <div
          className={`${STYLES.footer} ${available ? "" : STYLES.unavailable}`}
        >
          {option && (
            <Price
              original={option.price}
              discounted={option.final}
              from={MenuLookup.isMultiSize(props.product)}
            />
          )}
          <Chevron size="s" />
        </div>
      </div>

      {badge && (
        <div className={STYLES.badge}>
          <Badge type={badge} compact />
        </div>
      )}

      <Button aria-label={name} onPress={props.onOpen} className={STYLES.action} />
    </div>
  );
}
