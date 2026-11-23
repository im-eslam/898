import { useLocale } from "@/shared/i18n";
import { formatExtra, formatFrom, formatPrice } from "../../util/price";

type PriceSize = "caption" | "small" | "body" | "heading";

interface BasePriceProps {
  size?: PriceSize;
  className?: string;
}

interface DiscountedPriceProps extends BasePriceProps {
  original: number;
  discounted: number;
  from?: boolean;
}

interface ExtraPriceProps extends BasePriceProps {
  extra: number;
}

type PriceProps = DiscountedPriceProps | ExtraPriceProps;

const STYLES = {
  root: "inline-flex flex-wrap items-baseline gap-x-1.5",
  primary: "font-bold tabular-nums",
  struckThrough:
    "text-caption font-medium text-navy/65 tabular-nums line-through",
  sizes: {
    caption: "text-caption",
    small: "text-small",
    body: "text-body",
    heading: "text-heading",
  } satisfies Record<PriceSize, string>,
} as const;

export function Price(props: PriceProps) {
  const locale = useLocale();
  const classes = [STYLES.root, props.className].filter(Boolean).join(" ");
  const primaryClass = `${STYLES.primary} ${STYLES.sizes[props.size ?? "small"]}`;

  if ("extra" in props) {
    return (
      <span className={classes}>
        <bdi className={primaryClass}>{formatExtra(props.extra, locale)}</bdi>
      </span>
    );
  }

  return (
    <span className={classes}>
      <bdi className={primaryClass}>
        {props.from
          ? formatFrom(props.discounted, locale)
          : formatPrice(props.discounted, locale)}
      </bdi>
      {props.original > props.discounted && (
        <bdi className={STYLES.struckThrough}>
          {formatPrice(props.original, locale)}
        </bdi>
      )}
    </span>
  );
}
