import { useState } from "react";
import type { AdminCategory, AdminCategoryInput, LocalizedText } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { LocalizedTextField } from "../fields/localized-text-field";
import { FormFooter } from "../form-footer";
import { MenuDialog } from "../menu-dialog";

const EMPTY_NAME: LocalizedText = { en: "", ar: "" };

interface CategoryFormDialogProps {
  isOpen: boolean;
  initial: AdminCategory | null;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSave: (input: AdminCategoryInput) => void;
}

export function CategoryFormDialog({ isOpen, initial, isSaving, error, onClose, onSave }: CategoryFormDialogProps) {
  const s = useStrings(strings);
  const [name, setName] = useState<LocalizedText>(initial?.name ?? EMPTY_NAME);
  const isValid = name.en.trim().length > 0 && name.ar.trim().length > 0;
  const submit = () => {
    if (isValid && !isSaving) onSave({ name });
  };

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="sm"
      title={initial ? s.categories.editTitle : s.categories.addTitle}
      error={error}
      onClose={onClose}
      onSubmit={submit}
      footer={<FormFooter isSaving={isSaving} isSubmitDisabled={!isValid} onCancel={onClose} />}
    >
      <LocalizedTextField label={s.categories.name} value={name} onChange={setName} />
    </MenuDialog>
  );
}
