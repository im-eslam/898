import type { ReactNode } from "react";
import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";

interface ReorderRowProps {
  children: ReactNode;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
  moveUpLabel: string;
  moveDownLabel: string;
  editLabel: string;
  deleteLabel: string;
  isDeleting?: boolean;
}

const STYLES = {
  row: "flex items-center gap-3 rounded-lg border border-navy/10 bg-white p-3 shadow-card",
  order: "flex shrink-0 flex-col",
  content: "min-w-0 flex-1",
  actions: "flex shrink-0 items-center gap-1.5",
} as const;

export function ReorderRow({
  children,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  moveUpLabel,
  moveDownLabel,
  editLabel,
  deleteLabel,
  isDeleting,
}: ReorderRowProps) {
  return (
    <div className={STYLES.row}>
      <div className={STYLES.order}>
        <Button
          aria-label={moveUpLabel}
          isDisabled={!canMoveUp}
          onPress={onMoveUp}
          className={CONTROL_STYLES.iconButtonGhost}
        >
          <Icon name="arrow" size={16} className="-rotate-90" />
        </Button>
        <Button
          aria-label={moveDownLabel}
          isDisabled={!canMoveDown}
          onPress={onMoveDown}
          className={CONTROL_STYLES.iconButtonGhost}
        >
          <Icon name="arrow" size={16} className="rotate-90" />
        </Button>
      </div>
      <div className={STYLES.content}>{children}</div>
      <div className={STYLES.actions}>
        <Button
          aria-label={editLabel}
          onPress={onEdit}
          className={CONTROL_STYLES.iconButton}
        >
          <Icon name="settings" size={17} />
        </Button>
        <Button
          aria-label={deleteLabel}
          isDisabled={isDeleting}
          onPress={onDelete}
          className={CONTROL_STYLES.iconButtonDanger}
        >
          <Icon name="trash" size={17} />
        </Button>
      </div>
    </div>
  );
}
