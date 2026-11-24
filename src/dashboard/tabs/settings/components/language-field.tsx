import { Label, Radio, RadioGroup } from "react-aria-components";
import { ADMIN_LANGUAGES, type AdminLanguage } from "@api/contracts";

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  options: "flex flex-wrap gap-2",
  option:
    "inline-flex h-11 cursor-pointer items-center rounded-full border border-navy/15 bg-white px-5 text-small font-bold text-navy outline-none transition-colors ease-smooth data-selected:border-brand data-selected:bg-arctic data-selected:text-brand data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand",
} as const;

interface LanguageFieldProps {
  label: string;
  options: Record<AdminLanguage, string>;
  value: AdminLanguage;
  onChange: (value: AdminLanguage) => void;
}

export function LanguageField(props: LanguageFieldProps) {
  return (
    <RadioGroup
      value={props.value}
      onChange={(next) => props.onChange(next as AdminLanguage)}
      className={STYLES.field}
    >
      <Label className={STYLES.label}>{props.label}</Label>
      <div className={STYLES.options}>
        {ADMIN_LANGUAGES.map((code) => (
          <Radio key={code} value={code} className={STYLES.option}>
            {props.options[code]}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
