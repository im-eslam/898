import { useState } from "react";
import type { AdminPairing, AdminPairingInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { NumberInputField } from "../fields/number-field";
import { SearchSelectField, type SearchSelectOption } from "../fields/search-select-field";
import { FormFooter } from "../form-footer";
import { MenuDialog } from "../menu-dialog";

interface PairingFormDialogProps {
  isOpen: boolean;
  initial: AdminPairing | null;
  products: SearchSelectOption[];
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSave: (input: AdminPairingInput) => void;
}

export function PairingFormDialog({ isOpen, initial, products, isSaving, error, onClose, onSave }: PairingFormDialogProps) {
  const s = useStrings(strings);
  const [firstId, setFirstId] = useState<string | null>(initial ? String(initial.productIds[0]) : null);
  const [secondId, setSecondId] = useState<string | null>(initial ? String(initial.productIds[1]) : null);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discount, setDiscount] = useState(initial?.discount ?? 0);

  // Each picker hides the product already chosen in the other one.
  const firstOptions = products.filter((p) => p.id !== secondId);
  const secondOptions = products.filter((p) => p.id !== firstId);
  const isSameProduct = firstId !== null && firstId === secondId;
  const isDiscountValid = discount <= price;
  const isValid = firstId !== null && secondId !== null && !isSameProduct && isDiscountValid;
  const finalPrice = Math.max(price - discount, 0);

  const submit = () => {
    if (!isValid || firstId === null || secondId === null || isSaving) return;
    onSave({ productIds: [Number(firstId), Number(secondId)], price, discount });
  };

  return (
    <MenuDialog
      isOpen={isOpen}
      isDismissable={!isSaving}
      size="md"
      title={initial ? s.pairings.editTitle : s.pairings.addTitle}
      error={error}
      onClose={onClose}
      onSubmit={submit}
      footer={<FormFooter isSaving={isSaving} isSubmitDisabled={!isValid} onCancel={onClose} />}
    >
      <div className="flex flex-col gap-5">
        <SearchSelectField
          label={s.pairings.firstItem}
          value={firstId}
          options={firstOptions}
          onChange={setFirstId}
          placeholder={s.pairings.selectProduct}
          emptyLabel={s.pairings.noResults}
        />
        <SearchSelectField
          label={s.pairings.secondItem}
          value={secondId}
          options={secondOptions}
          onChange={setSecondId}
          placeholder={s.pairings.selectProduct}
          emptyLabel={s.pairings.noResults}
          error={isSameProduct ? s.errors.MENU_PAIRING_ITEMS_INVALID : undefined}
        />

        <div className="grid gap-4 @sm:grid-cols-2">
          <NumberInputField label={s.pairings.price} value={price} onChange={setPrice} suffix="EGP" />
          <NumberInputField
            label={s.pairings.discount}
            value={discount}
            onChange={setDiscount}
            suffix="EGP"
            error={isDiscountValid ? undefined : s.errors.MENU_DISCOUNT_INVALID}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-brand/25 bg-brand/5 px-4 py-3">
          <span className="text-small font-bold text-navy">{s.pairings.finalPrice}</span>
          <span className="text-heading font-bold text-brand tabular-nums">{finalPrice} EGP</span>
        </div>
      </div>
    </MenuDialog>
  );
}
