import type { ReactNode } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";
import { strings } from "../strings";

interface ReorderRowProps {
  itemName: string;
  children: ReactNode;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  // Disables edit and delete while something else is being deleted. Moving never waits.
  isBusy?: boolean;
  isDeleting?: boolean;
}

const STYLES = {
  row: "flex items-center gap-2 rounded-lg border border-navy/10 bg-white p-2 sm:gap-3 sm:p-3",
  order: "flex shrink-0 flex-col gap-1",
  move: "data-disabled:pointer-events-none data-disabled:opacity-35",
  content: "min-w-0 flex-1",
  actions: "flex shrink-0 items-center gap-1 sm:gap-1.5",
} as const;

// One list row: move up and down, the content, then edit and delete when the list has them.
// Button labels name the item, so a screen reader says "Move up: Espresso", not just "Move up".
export function ReorderRow({
  itemName,
  children,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  isBusy = false,
  isDeleting = false,
}: ReorderRowProps) {
  const s = useStrings(strings).common;

  return (
    <div className={STYLES.row}>
      <div className={STYLES.order}>
        <Button
          aria-label={`${s.moveUp}: ${itemName}`}
          isDisabled={!canMoveUp}
          onPress={onMoveUp}
          className={`${CONTROL_STYLES.iconButton} ${STYLES.move}`}
        >
          <Icon name="arrow" size={16} className="-rotate-90" />
        </Button>
        <Button
          aria-label={`${s.moveDown}: ${itemName}`}
          isDisabled={!canMoveDown}
          onPress={onMoveDown}
          className={`${CONTROL_STYLES.iconButton} ${STYLES.move}`}
        >
          <Icon name="arrow" size={16} className="rotate-90" />
        </Button>
      </div>
      <div className={STYLES.content}>{children}</div>
      {(onEdit || onDelete) && (
        <div className={STYLES.actions}>
          {onEdit && (
            <Button
              aria-label={`${s.edit}: ${itemName}`}
              isDisabled={isBusy}
              onPress={onEdit}
              className={CONTROL_STYLES.iconButton}
            >
              <Icon name="settings" size={17} />
            </Button>
          )}
          {onDelete && (
            <Button
              aria-label={`${s.delete}: ${itemName}`}
              isDisabled={isBusy || isDeleting}
              onPress={onDelete}
              className={CONTROL_STYLES.iconButtonDanger}
            >
              <Icon name="trash" size={17} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
