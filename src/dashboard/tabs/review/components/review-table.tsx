import { Button, Checkbox } from "react-aria-components";
import type { ReviewDto } from "@api/contracts";
import { useLocale, useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { fill } from "../lib/fill";
import { formatCreatedAt } from "../lib/format-date";
import { strings } from "../strings";
import { SelectBox } from "./select-box";

const STYLES = {
  wrap: "overflow-x-auto rounded-xl border border-sand/70 bg-white",
  table:
    "w-full min-w-[720px] border-collapse text-start text-body text-charcoal",
  head: "border-b border-sand bg-cream px-4 py-3 text-start text-small font-bold text-charcoal",
  row: "cursor-pointer border-b border-sand/50 transition-colors ease-smooth last:border-0 hover:bg-cream/70 data-[selected=true]:bg-arctic",
  cell: "px-4 py-3 align-middle",
  check:
    "inline-flex size-10 items-center justify-center rounded-full outline-none",
  checkCell: "w-16 px-2",
  nameCell: "max-w-[12rem] font-bold text-charcoal",
  muted: "text-charcoal/80",
  preview: "line-clamp-2 block max-w-md",
  actionsCell: "w-20 px-2",
} as const;

interface ReviewTableProps {
  items: ReviewDto[];
  selected: ReadonlySet<number>;
  onToggle: (id: number, on: boolean) => void;
  onToggleAll: (on: boolean) => void;
  onOpen: (review: ReviewDto) => void;
}

// Keeps checkbox and button clicks from also opening the row.
const stop = (event: { stopPropagation: () => void }) =>
  event.stopPropagation();

export function ReviewTable({
  items,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
}: ReviewTableProps) {
  const s = useStrings(strings);
  const locale = useLocale();

  const allSelected =
    items.length > 0 && items.every((review) => selected.has(review.id));
  const someSelected = items.some((review) => selected.has(review.id));

  return (
    <div className={STYLES.wrap}>
      <table className={STYLES.table}>
        <thead>
          <tr>
            <th className={`${STYLES.head} ${STYLES.checkCell}`} onClick={stop}>
              <Checkbox
                isSelected={allSelected}
                isIndeterminate={someSelected && !allSelected}
                onChange={onToggleAll}
                aria-label={s.table.selectAll}
                className={STYLES.check}
              >
                {({ isSelected, isIndeterminate, isFocusVisible }) => (
                  <SelectBox
                    isSelected={isSelected}
                    isIndeterminate={isIndeterminate}
                    isFocusVisible={isFocusVisible}
                  />
                )}
              </Checkbox>
            </th>
            <th className={STYLES.head}>{s.table.name}</th>
            <th className={STYLES.head}>{s.table.contact}</th>
            <th className={STYLES.head}>{s.table.message}</th>
            <th className={STYLES.head}>{s.table.date}</th>
            <th className={`${STYLES.head} w-20`}>
              <span className="sr-only">{s.table.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((review) => {
            const name = review.name || s.review.anonymous;
            const isSelected = selected.has(review.id);

            return (
              <tr
                key={review.id}
                data-selected={isSelected}
                className={STYLES.row}
                onClick={() => onOpen(review)}
              >
                <td
                  className={`${STYLES.cell} ${STYLES.checkCell}`}
                  onClick={stop}
                >
                  <Checkbox
                    isSelected={isSelected}
                    onChange={(on) => onToggle(review.id, on)}
                    aria-label={fill(s.table.selectRow, { name })}
                    className={STYLES.check}
                  >
                    {({ isFocusVisible }) => (
                      <SelectBox
                        isSelected={isSelected}
                        isFocusVisible={isFocusVisible}
                      />
                    )}
                  </Checkbox>
                </td>
                <td className={`${STYLES.cell} ${STYLES.nameCell}`}>{name}</td>
                <td className={`${STYLES.cell} ${STYLES.muted}`}>
                  {review.contact || s.review.noContact}
                </td>
                <td className={STYLES.cell}>
                  <span className={STYLES.preview}>{review.message}</span>
                </td>
                <td className={`${STYLES.cell} ${STYLES.muted}`}>
                  {formatCreatedAt(review.created_at, locale)}
                </td>
                <td
                  className={`${STYLES.cell} ${STYLES.actionsCell}`}
                  onClick={stop}
                >
                  <Button
                    aria-label={`${s.review.open}: ${name}`}
                    onPress={() => onOpen(review)}
                    className={CONTROL_STYLES.iconButton}
                  >
                    <EyeIcon />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
