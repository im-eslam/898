import { Checkbox } from "react-aria-components";
import { mergeProps, useLongPress, usePress } from "react-aria";
import type { ReviewDto } from "@api/contracts";
import { useLocale, useStrings } from "@/shared/i18n";
import { fill } from "../lib/fill";
import { formatCreatedAt } from "../lib/format-date";
import { strings } from "../strings";
import { SelectBox } from "./select-box";

const STYLES = {
  list: "flex flex-col gap-3",
  card: "flex items-start gap-3 rounded-xl border bg-white p-4 transition-colors ease-smooth",
  cardOn: "border-brand bg-arctic",
  cardOff: "border-sand/70",
  check: "-m-2 shrink-0 p-2",
  body: "flex min-w-0 flex-1 cursor-pointer select-none flex-col gap-1.5 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  header: "flex items-baseline justify-between gap-3",
  name: "min-w-0 truncate text-body font-bold text-charcoal",
  date: "shrink-0 text-caption text-charcoal/70",
  contact: "text-small text-charcoal/80",
  message: "line-clamp-3 text-body text-charcoal",
} as const;

interface ReviewCardListProps {
  items: ReviewDto[];
  selected: ReadonlySet<number>;
  onToggle: (id: number, on: boolean) => void;
  onOpen: (review: ReviewDto) => void;
}

export function ReviewCardList({
  items,
  selected,
  onToggle,
  onOpen,
}: ReviewCardListProps) {
  return (
    <div className={STYLES.list}>
      {items.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          isSelected={selected.has(review.id)}
          onToggle={(on) => onToggle(review.id, on)}
          onOpen={() => onOpen(review)}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  isSelected,
  onToggle,
  onOpen,
}: {
  review: ReviewDto;
  isSelected: boolean;
  onToggle: (on: boolean) => void;
  onOpen: () => void;
}) {
  const s = useStrings(strings);
  const locale = useLocale();
  const name = review.name || s.review.anonymous;

  const { pressProps } = usePress({ onPress: onOpen });
  const { longPressProps } = useLongPress({
    accessibilityDescription: s.hint.longPress,
    onLongPress: () => onToggle(true),
  });

  // The checkbox and the tappable body are siblings, so the body can be a
  // role="button" without nesting an interactive control inside it.
  return (
    <article
      className={`${STYLES.card} ${isSelected ? STYLES.cardOn : STYLES.cardOff}`}
    >
      <div className={STYLES.check}>
        <Checkbox
          isSelected={isSelected}
          onChange={onToggle}
          aria-label={fill(s.table.selectRow, { name })}
          className="flex items-center justify-center outline-none"
        >
          {({ isFocusVisible }) => (
            <SelectBox
              isSelected={isSelected}
              isFocusVisible={isFocusVisible}
            />
          )}
        </Checkbox>
      </div>

      <div
        role="button"
        tabIndex={0}
        {...mergeProps(pressProps, longPressProps)}
        className={STYLES.body}
      >
        <div className={STYLES.header}>
          <span className={STYLES.name}>{name}</span>
          <span className={STYLES.date}>
            {formatCreatedAt(review.created_at, locale)}
          </span>
        </div>
        <span className={STYLES.contact}>
          {review.contact || s.review.noContact}
        </span>
        <span className={STYLES.message}>{review.message}</span>
      </div>
    </article>
  );
}
