import { useLocale, useStrings, type Locale } from "@/shared/i18n";
import { strings } from "../../strings";

type PriceSize = "caption" | "small" | "body" | "heading";

interface BasePriceProps {
  size?: PriceSize;
  className?: string;
}

interface StandardPriceProps extends BasePriceProps {
  amount: number;
}
interface DiscountedPriceProps extends BasePriceProps {
  original: number;
  discounted: number;
}
interface AddonPriceProps extends BasePriceProps {
  extra: number;
}

type PriceProps = StandardPriceProps | DiscountedPriceProps | AddonPriceProps;

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

class PriceFormatter {
  private static cache = new Map<Locale, Intl.NumberFormat>();

  private static number(value: number, locale: Locale): string {
    let formatter = this.cache.get(locale);
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
        numberingSystem: "latn",
      });
      this.cache.set(locale, formatter);
    }
    return formatter.format(Math.round(value));
  }

  static format(
    props: PriceProps,
    locale: Locale,
    labels: typeof strings.en.price
  ): { primary: string; struckThrough?: string } {
    if ("extra" in props) {
      return { primary: labels.extra(this.number(props.extra, locale)) };
    }
    if ("discounted" in props) {
      return {
        primary: labels.format(this.number(props.discounted, locale)),
        struckThrough:
          props.original > props.discounted
            ? labels.format(this.number(props.original, locale))
            : undefined,
      };
    }
    return { primary: labels.format(this.number(props.amount, locale)) };
  }
}

/** A price. Pass one amount, or an original and a discounted amount to strike the original through. */
export function Price(props: PriceProps) {
  const { price } = useStrings(strings);
  const locale = useLocale();

  const size = props.size ?? "small";
  const classes = [STYLES.root, props.className].filter(Boolean).join(" ");
  const formatted = PriceFormatter.format(props, locale, price);

  return (
    <span className={classes}>
      <bdi className={`${STYLES.primary} ${STYLES.sizes[size]}`}>
        {formatted.primary}
      </bdi>
      {formatted.struckThrough && (
        <bdi className={STYLES.struckThrough}>{formatted.struckThrough}</bdi>
      )}
    </span>
  );
}

/** The text of an amount in the menu's currency, for places that need a plain string, such as RollingNumber. */
export function formatPrice(amount: number, locale: Locale): string {
  return PriceFormatter.format({ amount }, locale, strings[locale].price)
    .primary;
}
