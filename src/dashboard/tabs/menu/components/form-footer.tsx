import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { strings } from "../strings";

interface FormFooterProps {
  isSaving: boolean;
  isSubmitDisabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
}

// Cancel and Save. Save is a submit button, so Enter works too.
// On phones Save sits on top, where the thumb reaches it first.
export function FormFooter({ isSaving, isSubmitDisabled = false, submitLabel, cancelLabel, onCancel }: FormFooterProps) {
  const s = useStrings(strings).common;
  return (
    <div className="flex flex-col-reverse gap-3 @sm:flex-row @sm:justify-end">
      <Button isDisabled={isSaving} onPress={onCancel} className={`${CONTROL_STYLES.button} w-full @sm:w-auto`}>
        {cancelLabel ?? s.cancel}
      </Button>
      <Button
        type="submit"
        isDisabled={isSaving || isSubmitDisabled}
        className={`${CONTROL_STYLES.buttonPrimary} w-full @sm:w-auto`}
      >
        {isSaving ? s.saving : (submitLabel ?? s.save)}
      </Button>
    </div>
  );
}
