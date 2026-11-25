import { useState } from "react";
import { Button, Form } from "react-aria-components";
import type { AdminCategoryInput, LocalizedText } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
import { getErrorMessage } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { LocalizedTextField } from "../fields/localized-text-field";
import { MenuDialog } from "../menu-dialog";

const EMPTY_NAME: LocalizedText = { en: "", ar: "" };

interface CategoryFormDialogProps {
  isOpen: boolean;
  initial: AdminCategoryInput | null;
  isSaving: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: AdminCategoryInput) => void;
}

export function CategoryFormDialog({
  isOpen,
  initial,
  isSaving,
  error,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const s = useStrings(strings);
  const [name, setName] = useState<LocalizedText>(initial?.name ?? EMPTY_NAME);

  const isValid = name.en.trim().length > 0 && name.ar.trim().length > 0;

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="sm"
      title={initial ? s.categories.editTitle : s.categories.addTitle}
      closeLabel={s.dialog.close}
      onClose={onClose}
    >
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid) onSubmit({ name });
        }}
        className="flex flex-col gap-5"
      >
        <LocalizedTextField
          label={s.categories.name}
          value={name}
          onChange={setName}
          enLabel={s.common.nameEn}
          arLabel={s.common.nameAr}
        />

        {error !== null && error !== undefined && (
          <p role="alert" className="text-small font-bold text-error">
            {getErrorMessage(s.errors, error)}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            isDisabled={isSaving}
            onPress={onClose}
            className={CONTROL_STYLES.button}
          >
            {s.common.cancel}
          </Button>
          <Button
            type="submit"
            isDisabled={isSaving || !isValid}
            className={CONTROL_STYLES.buttonPrimary}
          >
            {isSaving ? s.common.saving : s.common.save}
          </Button>
        </div>
      </Form>
    </MenuDialog>
  );
}
