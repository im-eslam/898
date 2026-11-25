import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { strings } from "../strings";
import { MenuDialog } from "./menu-dialog";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  text: string;
  warnings?: string[];
  isLoading?: boolean;
  isDeleting: boolean;
  // False while there is nothing to confirm, for example when the usage check failed.
  canConfirm?: boolean;
  confirmLabel?: string;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

// Every removal goes through this. Cancel has focus, so Enter never deletes by accident.
export function ConfirmDeleteDialog({
  isOpen,
  title,
  text,
  warnings = [],
  isLoading = false,
  isDeleting,
  canConfirm = true,
  confirmLabel,
  error,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const s = useStrings(strings);

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isDeleting}
      size="xs"
      title={title}
      error={error}
      onClose={onCancel}
      footer={
        <div className="flex flex-col-reverse gap-3 @sm:flex-row @sm:justify-end">
          <Button autoFocus isDisabled={isDeleting} onPress={onCancel} className={`${CONTROL_STYLES.button} w-full @sm:w-auto`}>
            {s.confirm.cancel}
          </Button>
          <Button
            isDisabled={isDeleting || isLoading || !canConfirm}
            onPress={onConfirm}
            className={`${CONTROL_STYLES.buttonDanger} w-full @sm:w-auto`}
          >
            {isDeleting ? s.common.deleting : (confirmLabel ?? s.common.delete)}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-body text-navy/80">{isLoading ? s.confirm.loading : text}</p>
        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-md border border-honey/40 bg-honey/15 px-4 py-3 text-small font-bold text-navy">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </div>
    </MenuDialog>
  );
}
