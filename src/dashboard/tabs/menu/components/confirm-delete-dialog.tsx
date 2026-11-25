import { Button } from "react-aria-components";
import { CONTROL_STYLES } from "../control-styles";
import { MenuDialog } from "./menu-dialog";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  text: string;
  warnings?: string[];
  isLoading?: boolean;
  isDeleting: boolean;
  error?: string;
  closeLabel: string;
  cancelLabel: string;
  confirmLabel: string;
  deletingLabel: string;
  loadingLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const STYLES = {
  body: "flex flex-col gap-4",
  text: "text-body text-navy/80",
  warnings:
    "flex flex-col gap-1 rounded-md border border-honey/40 bg-honey/15 px-4 py-3 text-small font-bold text-navy",
  error:
    "text-small rounded-md border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  actions: "flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end",
  fullWidthOnPhone: "w-full sm:w-auto",
} as const;

export function ConfirmDeleteDialog({
  isOpen,
  title,
  text,
  warnings = [],
  isLoading = false,
  isDeleting,
  error,
  closeLabel,
  cancelLabel,
  confirmLabel,
  deletingLabel,
  loadingLabel,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isDeleting}
      size="sm"
      title={title}
      closeLabel={closeLabel}
      onClose={onCancel}
    >
      <div className={STYLES.body}>
        <p className={STYLES.text}>{isLoading ? loadingLabel : text}</p>
        {warnings.length > 0 && (
          <ul className={STYLES.warnings}>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className={STYLES.error}>
            {error}
          </p>
        )}
        <div className={STYLES.actions}>
          <Button
            autoFocus
            isDisabled={isDeleting}
            onPress={onCancel}
            className={`${CONTROL_STYLES.button} ${STYLES.fullWidthOnPhone}`}
          >
            {cancelLabel}
          </Button>
          <Button
            isDisabled={isDeleting || isLoading}
            onPress={onConfirm}
            className={`${CONTROL_STYLES.buttonDanger} ${STYLES.fullWidthOnPhone}`}
          >
            {isDeleting ? deletingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </MenuDialog>
  );
}
