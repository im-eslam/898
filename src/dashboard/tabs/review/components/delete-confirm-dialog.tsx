import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { fill } from "../lib/fill";
import { strings } from "../strings";
import { ResponsiveDialog } from "./responsive-dialog";

const STYLES = {
  body: "flex flex-col gap-6",
  text: "text-body text-charcoal/85",
  actions: "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  fullWidthOnPhone: "w-full sm:w-auto",
} as const;

interface DeleteConfirmDialogProps {
  count: number;
  isOpen: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ count, isOpen, isDeleting, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  const s = useStrings(strings);
  const title = count === 1 ? s.confirm.title : fill(s.confirm.titleMany, { count });

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      isDismissable={!isDeleting}
      size="md"
      title={title}
      closeLabel={s.dialog.close}
      onClose={onCancel}
    >
      <div className={STYLES.body}>
        <p className={STYLES.text}>{s.confirm.text}</p>
        <div className={STYLES.actions}>
          <Button autoFocus isDisabled={isDeleting} onPress={onCancel} className={`${CONTROL_STYLES.button} ${STYLES.fullWidthOnPhone}`}>
            {s.confirm.cancel}
          </Button>
          <Button isDisabled={isDeleting} onPress={onConfirm} className={`${CONTROL_STYLES.buttonDanger} ${STYLES.fullWidthOnPhone}`}>
            {isDeleting ? s.confirm.deleting : s.confirm.confirm}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
