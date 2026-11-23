import { Icon } from "@/shared/icons";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { formatSavings } from "../../util/price";

type StatusBadgeType = "top" | "new" | "outOfStock";
type BadgeType = StatusBadgeType | "savings";

type BadgeProps =
  | {
      type: StatusBadgeType;
      compact?: boolean;
      className?: string;
    }
  | {
      type: "savings";
      amount: number;
      compact?: boolean;
      className?: string;
    };

const STYLES = {
  base: "inline-flex max-w-full items-center gap-1 overflow-hidden rounded-full text-caption whitespace-nowrap",
  regular: "min-h-6 px-3 py-1",
  compact: "min-h-5 px-2 py-0.5",
  star: "size-3 shrink-0",
  label: "truncate",
  tone: {
    top: "bg-honey font-semibold text-charcoal",
    new: "bg-brand font-semibold text-white",
    outOfStock: "bg-white/85 font-semibold text-navy ring-1 ring-navy/30",
    savings: "bg-success font-semibold text-white",
  } satisfies Record<BadgeType, string>,
} as const;

export function Badge(props: BadgeProps) {
  const { badges } = useStrings(strings);
  const locale = useLocale();

  const size = props.compact ? STYLES.compact : STYLES.regular;
  const classes = [STYLES.base, size, STYLES.tone[props.type], props.className]
    .filter(Boolean)
    .join(" ");
  const label =
    props.type === "savings"
      ? formatSavings(props.amount, locale)
      : badges[props.type];

  return (
    <span className={classes}>
      {props.type === "top" && <Icon name="star" className={STYLES.star} />}
      <span className={STYLES.label}>
        {props.type === "savings" ? <bdi>{label}</bdi> : label}
      </span>
    </span>
  );
}
