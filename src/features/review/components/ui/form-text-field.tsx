import {
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
  TextField,
  type ValidationResult,
} from "react-aria-components";

interface FormTextFieldProps {
  name: string;
  kind: "input" | "textarea";
  label: string;
  hint?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  isRequired?: boolean;
  minLength?: number;
  maxLength: number;
  errorMessage?: string | ((validation: ValidationResult) => string);
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

export function FormTextField(props: FormTextFieldProps) {
  return (
    <TextField
      name={props.name}
      autoFocus={props.autoFocus}
      isRequired={props.isRequired}
      minLength={props.minLength}
      maxLength={props.maxLength}
      className={STYLES.wrapper}
      dir="auto"
    >
      <Label className={STYLES.label}>{props.label}</Label>

      {props.kind === "textarea" ? (
        <TextArea rows={5} className={`${STYLES.control} ${STYLES.textarea}`} />
      ) : (
        <Input autoComplete={props.autoComplete} className={STYLES.control} />
      )}

      {props.hint ? (
        <Text slot="description" className={STYLES.hint}>
          {props.hint}
        </Text>
      ) : null}

      <FieldError className={STYLES.error}>{props.errorMessage}</FieldError>
    </TextField>
  );
}
