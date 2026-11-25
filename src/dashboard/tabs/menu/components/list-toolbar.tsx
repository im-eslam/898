import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";

interface ListToolbarProps {
  count?: string;
  actionLabel: string;
  onAction: () => void;
}

// The line above every list: an optional count and the Add button.
// The tab name already says what the list is, so there is no heading here.
export function ListToolbar({ count, actionLabel, onAction }: ListToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-small font-bold text-navy/70">{count}</span>
      <Button onPress={onAction} className={CONTROL_STYLES.buttonPrimary}>
        <Icon name="plus" size={16} />
        {actionLabel}
      </Button>
    </div>
  );
}
