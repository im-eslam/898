import { Button, Radio, RadioGroup } from "react-aria-components";
import type { AdminPricing, AdminPricingOption, LocalizedText, MenuPricingType } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { FOCUS_RING } from "../../control-styles";
import { strings } from "../../strings";
import { LocalizedTextField } from "../fields/localized-text-field";
import { NumberInputField } from "../fields/number-field";

const EMPTY_NAME: LocalizedText = { en: "", ar: "" };
const MAX_OPTIONS = 10;

function emptyOption(): AdminPricingOption {
  return { name: EMPTY_NAME, price: 0, discount: 0 };
}

// @container: the price and discount pairs sit side by side only when this editor has room,
// whatever the dialog's width is.
const STYLES = {
  field: "@container flex flex-col gap-2",
  label: "text-small font-bold text-navy",
  typeRow: "flex gap-3",
  typeOption: `flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md border border-navy/15 bg-white px-4 text-small text-navy transition-colors ease-smooth data-selected:border-brand data-selected:font-bold data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand`,
  pairRow: "grid gap-3 @sm:grid-cols-2",
  options: "flex flex-col gap-3",
  option: "flex flex-col gap-3 rounded-md border border-navy/10 bg-cream/60 p-3",
  optionHeader: "flex items-center justify-between gap-2",
  optionTitle: "text-caption font-bold text-navy/70",
  removeButton: `inline-flex size-10 shrink-0 items-center justify-center rounded-full text-error transition-colors ease-smooth outline-none hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error data-disabled:pointer-events-none data-disabled:opacity-30`,
  addButton: `inline-flex min-h-11 items-center justify-center gap-1.5 self-start rounded-full border border-dashed border-navy/25 px-4 text-small font-bold text-navy/70 transition-colors ease-smooth hover:border-brand hover:text-brand ${FOCUS_RING} data-disabled:pointer-events-none data-disabled:opacity-40`,
} as const;

interface PricingEditorProps {
  pricing: AdminPricing;
  onChange: (pricing: AdminPricing) => void;
  discountError: string;
}

// Single price, or several named sizes. Removing a size only changes this form until Save.
export function PricingEditor({ pricing, onChange, discountError }: PricingEditorProps) {
  const all = useStrings(strings);
  const s = all.products.pricing;
  const first = pricing.options[0];

  const setType = (type: MenuPricingType) => {
    if (type === pricing.type) return;
    const base = pricing.options[0] ?? emptyOption();
    if (type === "single") {
      onChange({ type, options: [{ name: null, price: base.price, discount: base.discount }] });
    } else {
      onChange({
        type,
        options: [{ name: EMPTY_NAME, price: base.price, discount: base.discount }, emptyOption()],
      });
    }
  };

  const updateOption = (index: number, patch: Partial<AdminPricingOption>) => {
    const next = pricing.options.map((option, i) => (i === index ? { ...option, ...patch } : option));
    onChange({ ...pricing, options: next });
  };

  const addOption = () => {
    if (pricing.options.length >= MAX_OPTIONS) return;
    onChange({ ...pricing, options: [...pricing.options, emptyOption()] });
  };

  const removeOption = (index: number) => {
    if (pricing.options.length <= 2) return;
    onChange({ ...pricing, options: pricing.options.filter((_, i) => i !== index) });
  };

  return (
    <div className={STYLES.field}>
      <span className={STYLES.label} id="pricing-type-label">
        {s.label}
      </span>
      <RadioGroup
        aria-labelledby="pricing-type-label"
        value={pricing.type}
        onChange={(value) => setType(value as MenuPricingType)}
        className={STYLES.typeRow}
      >
        <Radio value="single" className={STYLES.typeOption}>
          {s.type.single}
        </Radio>
        <Radio value="multiple" className={STYLES.typeOption}>
          {s.type.multiple}
        </Radio>
      </RadioGroup>

      {pricing.type === "single" ? (
        <div className={STYLES.pairRow}>
          <NumberInputField
            label={s.singlePrice}
            value={first?.price ?? 0}
            onChange={(price) => updateOption(0, { price })}
            suffix="EGP"
          />
          <NumberInputField
            label={s.singleDiscount}
            value={first?.discount ?? 0}
            onChange={(discount) => updateOption(0, { discount })}
            suffix="EGP"
            error={first && first.discount > first.price ? discountError : undefined}
          />
        </div>
      ) : (
        <div className={STYLES.options}>
          {pricing.options.map((option, index) => (
            <div key={index} className={STYLES.option}>
              <div className={STYLES.optionHeader}>
                <span className={STYLES.optionTitle}>
                  {s.optionsLabel} {index + 1}
                </span>
                <Button
                  aria-label={`${s.removeOption} ${index + 1}`}
                  isDisabled={pricing.options.length <= 2}
                  onPress={() => removeOption(index)}
                  className={STYLES.removeButton}
                >
                  <Icon name="trash" size={16} />
                </Button>
              </div>
              <LocalizedTextField
                label={s.optionName}
                value={option.name ?? EMPTY_NAME}
                onChange={(name) => updateOption(index, { name })}
              />
              <div className={STYLES.pairRow}>
                <NumberInputField
                  label={s.optionPrice}
                  value={option.price}
                  onChange={(price) => updateOption(index, { price })}
                  suffix="EGP"
                />
                <NumberInputField
                  label={s.optionDiscount}
                  value={option.discount}
                  onChange={(discount) => updateOption(index, { discount })}
                  suffix="EGP"
                  error={option.discount > option.price ? discountError : undefined}
                />
              </div>
            </div>
          ))}
          <Button isDisabled={pricing.options.length >= MAX_OPTIONS} onPress={addOption} className={STYLES.addButton}>
            <Icon name="plus" size={16} />
            {s.addOption}
          </Button>
        </div>
      )}
    </div>
  );
}
