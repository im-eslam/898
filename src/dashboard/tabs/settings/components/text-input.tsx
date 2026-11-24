import {
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";

interface TextInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
  error?: string;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  input:
    "w-full rounded-md border border-navy/15 bg-white py-3 ps-4 pe-4 text-body text-navy outline-none transition-colors ease-smooth focus:border-brand data-invalid:border-error",
  hint: "text-caption text-navy/70",
  error: "text-small font-bold text-error",
} as const;

export function TextInput({
  name,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
}: TextInputProps) {
  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      className={STYLES.field}
    >
      <Label className={STYLES.label}>{label}</Label>
      <Input
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        dir="ltr"
        className={STYLES.input}
      />
      {hint && (
        <Text slot="description" className={STYLES.hint}>
          {hint}
        </Text>
      )}
      <FieldError className={STYLES.error}>{error}</FieldError>
    </TextField>
  );
}
