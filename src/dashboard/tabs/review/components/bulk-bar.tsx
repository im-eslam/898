import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";
import { fill } from "../lib/fill";
import { strings } from "../strings";

const STYLES = {
  bar: "sticky top-3 z-20 flex flex-nowrap items-center justify-between gap-2 rounded-xl border border-brand/40 bg-arctic px-3 py-3 text-charcoal sm:px-4",
  count: "shrink text-small font-bold text-charcoal",
  actions: "flex shrink-0 flex-nowrap items-center gap-2",
  compactButton: "h-11 w-11 shrink-0 px-0 sm:w-auto sm:px-5",
  buttonLabel: "sr-only sm:not-sr-only",
} as const;

interface BulkBarProps {
  selectedCount: number;
  allSelected: boolean;
  isDeleting: boolean;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete: () => void;
}

export function BulkBar({
  selectedCount,
  allSelected,
  isDeleting,
  onSelectAll,
  onClear,
  onDelete,
}: BulkBarProps) {
  const s = useStrings(strings);

  return (
    <div role="region" aria-label={s.bulk.region} className={STYLES.bar}>
      <span aria-live="polite" className={STYLES.count}>
        {fill(s.bulk.selected, { count: selectedCount })}
      </span>
      <div className={STYLES.actions}>
        {!allSelected && (
          <Button
            aria-label={s.bulk.selectAll}
            onPress={onSelectAll}
            className={`${CONTROL_STYLES.button} ${STYLES.compactButton}`}
          >
            <Icon name="check" size={16} />
            <span className={STYLES.buttonLabel}>{s.bulk.selectAll}</span>
          </Button>
        )}
        <Button
          aria-label={s.bulk.clear}
          onPress={onClear}
          className={`${CONTROL_STYLES.button} ${STYLES.compactButton}`}
        >
          <Icon name="close" size={16} />
          <span className={STYLES.buttonLabel}>{s.bulk.clear}</span>
        </Button>
        <Button
          aria-label={s.bulk.delete}
          isDisabled={isDeleting}
          onPress={onDelete}
          className={`${CONTROL_STYLES.buttonDanger} ${STYLES.compactButton}`}
        >
          <Icon name="trash" size={16} />
          <span className={STYLES.buttonLabel}>{s.bulk.delete}</span>
        </Button>
      </div>
    </div>
  );
}
