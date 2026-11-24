import { Label, Radio, RadioGroup } from "react-aria-components";
import type { AdminLanguage } from "@api/contracts";

interface LanguageInputProps {
  label: string;
  value: AdminLanguage;
  options: readonly AdminLanguage[];
  labels: Record<AdminLanguage, string>;
  onChange: (value: AdminLanguage) => void;
}

const STYLES = {
  radioGroup: "flex flex-col gap-1.5",
  radioRow: "flex gap-3",
  radio:
    "flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-md border border-navy/15 bg-white px-4 text-body text-navy outline-none transition-colors ease-smooth data-selected:border-brand data-selected:font-bold data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand",
  label: "text-small font-bold text-navy",
} as const;

export function LanguageInput({
  label,
  value,
  options,
  labels,
  onChange,
}: LanguageInputProps) {
  return (
    <RadioGroup
      name="language"
      value={value}
      onChange={(next) => onChange(next as AdminLanguage)}
      className={STYLES.radioGroup}
    >
      <Label className={STYLES.label}>{label}</Label>
      <div className={STYLES.radioRow}>
        {options.map((option) => (
          <Radio key={option} value={option} className={STYLES.radio}>
            {labels[option]}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
