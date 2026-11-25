import { Input, Label, TextArea, TextField } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import type { LocalizedText } from "@api/contracts";
import { FIELD } from "../../control-styles";
import { strings } from "../../strings";

interface LocalizedTextFieldProps {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
}

const STYLES = {
  field: "flex flex-col gap-2.5",
  // English and Arabic stack, so each field keeps a full width even in a narrow dialog.
  stack: "flex flex-col gap-4",
  sub: "flex flex-col gap-1",
  subLabel: "text-caption font-bold text-navy/70",
  input: `${FIELD.control} px-3 py-2.5`,
} as const;

export function LocalizedTextField({ label, value, onChange, multiline = false }: LocalizedTextFieldProps) {
  const s = useStrings(strings).common;
  const Field = multiline ? TextArea : Input;

  return (
    <div className={STYLES.field}>
      <span className={FIELD.label}>{label}</span>
      <div className={STYLES.stack}>
        <TextField value={value.en} onChange={(en) => onChange({ ...value, en })} className={STYLES.sub}>
          <Label className={STYLES.subLabel}>{multiline ? s.textEn : s.nameEn}</Label>
          <Field dir="ltr" rows={multiline ? 3 : undefined} className={STYLES.input} />
        </TextField>
        <TextField value={value.ar} onChange={(ar) => onChange({ ...value, ar })} className={STYLES.sub}>
          <Label className={STYLES.subLabel}>{multiline ? s.textAr : s.nameAr}</Label>
          <Field dir="rtl" rows={multiline ? 3 : undefined} className={STYLES.input} />
        </TextField>
      </div>
    </div>
  );
}
