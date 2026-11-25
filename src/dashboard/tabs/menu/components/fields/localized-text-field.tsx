import { Input, Label, TextArea, TextField } from "react-aria-components";
import type { LocalizedText } from "@api/contracts";

interface LocalizedTextFieldProps {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  enLabel: string;
  arLabel: string;
  multiline?: boolean;
  error?: string;
}

const STYLES = {
  field: "flex flex-col gap-2",
  label: "text-small font-bold text-navy",
  row: "grid gap-3 sm:grid-cols-2",
  sub: "flex flex-col gap-1",
  subLabel: "text-caption font-bold text-navy/70",
  input:
    "w-full rounded-md border border-navy/15 bg-white py-2.5 px-3 text-body text-navy outline-none transition-colors ease-smooth focus:border-brand data-invalid:border-error",
  error: "text-small font-bold text-error",
} as const;

export function LocalizedTextField({
  label,
  value,
  onChange,
  enLabel,
  arLabel,
  multiline = false,
  error,
}: LocalizedTextFieldProps) {
  const Field = multiline ? TextArea : Input;

  return (
    <div className={STYLES.field}>
      <span className={STYLES.label}>{label}</span>
      <div className={STYLES.row}>
        <TextField
          value={value.en}
          onChange={(en) => onChange({ ...value, en })}
          isInvalid={Boolean(error)}
          validationBehavior="aria"
          className={STYLES.sub}
        >
          <Label className={STYLES.subLabel}>{enLabel}</Label>
          <Field
            dir="ltr"
            rows={multiline ? 3 : undefined}
            className={STYLES.input}
          />
        </TextField>
        <TextField
          value={value.ar}
          onChange={(ar) => onChange({ ...value, ar })}
          isInvalid={Boolean(error)}
          validationBehavior="aria"
          className={STYLES.sub}
        >
          <Label className={STYLES.subLabel}>{arLabel}</Label>
          <Field
            dir="rtl"
            rows={multiline ? 3 : undefined}
            className={STYLES.input}
          />
        </TextField>
      </div>
      {error && (
        <p role="alert" className={STYLES.error}>
          {error}
        </p>
      )}
    </div>
  );
}
