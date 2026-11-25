import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES, FIELD, FOCUS_RING } from "../../control-styles";
import { strings } from "../../strings";
import type { PickerItem } from "./picker-list";

interface PickerSummaryFieldProps {
  label: string;
  // Every item that could be chosen. Used to look up the names of the chosen ids.
  items: readonly PickerItem[];
  selectedIds: readonly number[];
  onRemove: (id: number) => void;
  onOpen: () => void;
  // Shown instead of "Nothing selected" when there is nothing to choose from at all.
  emptyLabel: string;
}

// How many chips show before the rest collapse into "+N". The picker lists the full set.
const MAX_CHIPS = 6;

const STYLES = {
  field: "flex flex-col gap-2.5",
  header: "flex items-center justify-between gap-3",
  count: "text-caption font-bold text-navy/70 tabular-nums",
  box: "flex min-h-14 flex-wrap content-start items-center gap-2 rounded-md border border-navy/15 bg-white p-2.5",
  chip: "inline-flex max-w-full items-center gap-1 rounded-full bg-brand/10 py-1 ps-3 pe-1 text-small font-bold text-brand",
  chipText: "min-w-0 truncate",
  chipRemove: `inline-flex size-7 shrink-0 items-center justify-center rounded-full text-brand transition-colors ease-smooth hover:bg-brand/15 ${FOCUS_RING}`,
  more: "inline-flex h-9 items-center rounded-full bg-navy/5 px-3 text-small font-bold text-navy/70",
  none: "px-1 text-small text-navy/70",
} as const;

// A short, fixed-height summary of a long selection. Chips can be removed in place, and the
// button opens the picker for everything else. Replaces a long scrolling checklist.
export function PickerSummaryField({
  label,
  items,
  selectedIds,
  onRemove,
  onOpen,
  emptyLabel,
}: PickerSummaryFieldProps) {
  const s = useStrings(strings).products.picker;
  const byId = new Map(items.map((item) => [item.id, item] as const));
  const chosen = selectedIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
  const visible = chosen.slice(0, MAX_CHIPS);
  const hiddenCount = chosen.length - visible.length;
  const isEmptyPool = items.length === 0;

  return (
    <div className={STYLES.field}>
      <div className={STYLES.header}>
        <span className={FIELD.label}>{label}</span>
        <Button
          isDisabled={isEmptyPool}
          onPress={onOpen}
          className={`${CONTROL_STYLES.button} h-10 px-4`}
        >
          {chosen.length > 0 ? s.edit : s.choose}
          {chosen.length > 0 && <span className={STYLES.count}>({chosen.length})</span>}
        </Button>
      </div>
      <div className={STYLES.box}>
        {chosen.length === 0 && <span className={STYLES.none}>{isEmptyPool ? emptyLabel : s.none}</span>}
        {visible.map((item) => (
          <span key={item.id} className={STYLES.chip}>
            <span className={STYLES.chipText}>{item.label}</span>
            <Button aria-label={s.remove(item.label)} onPress={() => onRemove(item.id)} className={STYLES.chipRemove}>
              <Icon name="close" size={14} />
            </Button>
          </span>
        ))}
        {hiddenCount > 0 && (
          <span dir="ltr" className={STYLES.more}>
            +{hiddenCount}
          </span>
        )}
      </div>
    </div>
  );
}
