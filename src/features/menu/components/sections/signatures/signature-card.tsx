import { Button } from "react-aria-components";
import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { MenuProductDto } from "@api/contracts";
import { MenuLookup, Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { Price } from "../../ui/price";
import { ProductImage } from "../../ui/product-image";

interface SignatureCardProps {
  product: MenuProductDto;
  priority?: boolean;
  onOpen: () => void;
}

const STYLES = {
  root: "duration-fast relative flex h-full flex-col gap-3 rounded-lg bg-paper p-3 transition-transform ease-smooth has-data-pressed:scale-[0.96] motion-reduce:transition-none sm:p-4",
  frame: "relative",
  image: "aspect-square w-full rounded-md",
  badge: "absolute end-2 bottom-2",
  body: "flex min-w-0 flex-col gap-1",
  name: "line-clamp-2 text-heading font-bold text-balance text-charcoal",
  description: "line-clamp-2 text-caption font-medium text-pretty text-navy/65",
  footer: "mt-auto flex items-center gap-2 pt-1",
  unavailable: "opacity-60",
  arrow: "ms-auto size-5 shrink-0 text-navy/40",
  action:
    "absolute inset-0 z-10 rounded-lg outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand",
} as const;

export function SignatureCard(props: SignatureCardProps) {
  const locale = useLocale();

  const name = props.product.name[locale];
  const description = props.product.description[locale];
  const available = Stock.isAvailable(props.product);
  const badge = Stock.badgeFor(props.product);
  const option = MenuLookup.startingOption(props.product);

  return (
    <div className={STYLES.root}>
      <div className={STYLES.frame}>
        <ProductImage
          image={props.product.image}
          kind="thumb"
          priority={props.priority}
          grayscale={!available}
          className={STYLES.image}
        />
        {badge && (
          <div className={STYLES.badge}>
            <Badge type={badge} compact />
          </div>
        )}
      </div>

      <div className={STYLES.body}>
        <span className={STYLES.name}>{name}</span>
        {description && (
          <span className={STYLES.description}>{description}</span>
        )}
      </div>

      <div
        className={`${STYLES.footer} ${available ? "" : STYLES.unavailable}`}
      >
        {option && (
          <Price
            original={option.price}
            discounted={option.final}
            from={MenuLookup.isMultiSize(props.product)}
            size="body"
          />
        )}
        <Icon name="arrow" className={STYLES.arrow} />
      </div>

      <Button
        aria-label={name}
        onPress={props.onOpen}
        className={STYLES.action}
      />
    </div>
  );
}
