import {
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
  type TextFieldProps,
} from "react-aria-components";

interface FormTextFieldProps {
  name: string;
  kind: "input" | "textarea";
  label: string;
  hint?: string;
  autoComplete?: string;
  maxLength: number;
  validate?: TextFieldProps["validate"];
}

const STYLES = {
  wrapper: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  control:
    "w-full rounded-md border border-navy/15 bg-white px-4 py-3 text-body text-navy placeholder:text-navy/40 outline-none transition-colors duration-interactive ease-smooth focus:border-brand data-[invalid]:border-error data-[invalid]:bg-error/5 motion-reduce:transition-none",
  textarea: "min-h-32 resize-y",
  hint: "text-caption text-navy/65",
  error: "text-caption text-error",
} as const;

export function FormTextField({
  name,
  kind,
  label,
  hint,
  autoComplete,
  maxLength,
  validate,
}: FormTextFieldProps) {
  return (
    <TextField
      name={name}
      maxLength={maxLength}
      validate={validate}
      className={STYLES.wrapper}
      dir="auto"
    >
      <Label className={STYLES.label}>{label}</Label>

      {kind === "textarea" ? (
        <TextArea rows={5} className={`${STYLES.control} ${STYLES.textarea}`} />
      ) : (
        <Input autoComplete={autoComplete} className={STYLES.control} />
      )}

      {hint ? <span className={STYLES.hint}>{hint}</span> : null}
      <FieldError className={STYLES.error} />
    </TextField>
  );
}
