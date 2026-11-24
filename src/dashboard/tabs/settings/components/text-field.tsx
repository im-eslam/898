import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  input:
    "w-full rounded-md border border-navy/15 bg-white px-4 py-3 text-body text-navy outline-none transition-colors ease-smooth focus:border-brand",
  hint: "text-small text-navy/70",
  error: "text-small font-bold text-error",
} as const;

interface TextFieldProps extends Omit<
  AriaTextFieldProps,
  "className" | "children"
> {
  label: string;
  description?: string;
}

export function TextField({ label, description, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className={STYLES.field}>
      <Label className={STYLES.label}>{label}</Label>
      <Input dir="ltr" className={STYLES.input} />
      {description && (
        <Text slot="description" className={STYLES.hint}>
          {description}
        </Text>
      )}
      <FieldError className={STYLES.error} />
    </AriaTextField>
  );
}
