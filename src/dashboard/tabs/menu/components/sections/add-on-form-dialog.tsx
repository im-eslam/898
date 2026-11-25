import { useState } from "react";
import type { AdminAddOn, AdminAddOnInput, LocalizedText } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { LocalizedTextField } from "../fields/localized-text-field";
import { NumberInputField } from "../fields/number-field";
import { FormFooter } from "../form-footer";
import { MenuDialog } from "../menu-dialog";

const EMPTY_NAME: LocalizedText = { en: "", ar: "" };

interface AddOnFormDialogProps {
  isOpen: boolean;
  initial: AdminAddOn | null;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSave: (input: AdminAddOnInput) => void;
}

export function AddOnFormDialog({ isOpen, initial, isSaving, error, onClose, onSave }: AddOnFormDialogProps) {
  const s = useStrings(strings);
  const [name, setName] = useState<LocalizedText>(initial?.name ?? EMPTY_NAME);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const isValid = name.en.trim().length > 0 && name.ar.trim().length > 0;
  const submit = () => {
    if (isValid && !isSaving) onSave({ name, price });
  };

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="sm"
      title={initial ? s.addOns.editTitle : s.addOns.addTitle}
      error={error}
      onClose={onClose}
      onSubmit={submit}
      footer={<FormFooter isSaving={isSaving} isSubmitDisabled={!isValid} onCancel={onClose} />}
    >
      <div className="flex flex-col gap-5">
        <LocalizedTextField label={s.addOns.name} value={name} onChange={setName} />
        <NumberInputField label={s.addOns.price} value={price} onChange={setPrice} suffix="EGP" />
      </div>
    </MenuDialog>
  );
}
