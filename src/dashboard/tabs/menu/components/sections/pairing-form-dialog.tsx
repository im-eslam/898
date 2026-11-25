import { useState } from "react";
import { Button, Form } from "react-aria-components";
import type { AdminPairingInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../../control-styles";
import { getErrorMessage } from "../../lib/get-error-message";
import { strings } from "../../strings";
import { MoneyField } from "../fields/money-field";
import { SelectField } from "../fields/select-field";
import { MenuDialog } from "../menu-dialog";

interface PairingFormDialogProps {
  isOpen: boolean;
  initial: AdminPairingInput | null;
  products: { id: number; label: string }[];
  isSaving: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: AdminPairingInput) => void;
}

export function PairingFormDialog({
  isOpen,
  initial,
  products,
  isSaving,
  error,
  onClose,
  onSubmit,
}: PairingFormDialogProps) {
  const s = useStrings(strings);
  const [firstId, setFirstId] = useState<number | null>(
    initial?.productIds[0] ?? null
  );
  const [secondId, setSecondId] = useState<number | null>(
    initial?.productIds[1] ?? null
  );
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discount, setDiscount] = useState(initial?.discount ?? 0);

  const options = products.map((p) => ({ id: String(p.id), label: p.label }));
  const isValid =
    firstId !== null && secondId !== null && firstId !== secondId;

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="sm"
      title={initial ? s.pairings.editTitle : s.pairings.addTitle}
      closeLabel={s.dialog.close}
      onClose={onClose}
    >
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid && firstId !== null && secondId !== null) {
            onSubmit({ productIds: [firstId, secondId], price, discount });
          }
        }}
        className="flex flex-col gap-5"
      >
        <SelectField
          label={s.pairings.firstItem}
          value={firstId === null ? "" : String(firstId)}
          options={
            firstId === null
              ? [{ id: "", label: s.pairings.selectProduct }, ...options]
              : options
          }
          onChange={(value) => setFirstId(value ? Number(value) : null)}
        />
        <SelectField
          label={s.pairings.secondItem}
          value={secondId === null ? "" : String(secondId)}
          options={
            secondId === null
              ? [{ id: "", label: s.pairings.selectProduct }, ...options]
              : options
          }
          onChange={(value) => setSecondId(value ? Number(value) : null)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField
            label={s.pairings.price}
            value={price}
            onChange={setPrice}
            currencySuffix="EGP"
          />
          <MoneyField
            label={s.pairings.discount}
            value={discount}
            onChange={setDiscount}
            currencySuffix="EGP"
          />
        </div>

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
