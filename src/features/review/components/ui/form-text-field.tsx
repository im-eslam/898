import {
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
  type ValidationResult,
} from "react-aria-components";

interface FormTextFieldProps {
  name: string;
  kind: "input" | "textarea";
  label: string;
  errorMessage?: (validation: ValidationResult) => string;
  autoComplete?: string;
  autoFocus?: boolean;
  isRequired?: boolean;
  minLength?: number;
  maxLength: number;
}

const STYLES = {
  wrapper: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  control:
    "w-full rounded-md border border-navy/15 bg-white px-4 py-3 text-body text-navy placeholder:text-navy/40 outline-none transition-colors duration-interactive ease-smooth focus:border-brand data-[invalid]:border-error data-[invalid]:bg-error/5 motion-reduce:transition-none",
  textarea: "min-h-32 resize-y",
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
      validationBehavior="native"
      className={STYLES.wrapper}
      dir="auto"
    >
      <Label className={STYLES.label}>{props.label}</Label>

      {props.kind === "textarea" ? (
        <TextArea
          rows={5}
          enterKeyHint="done"
          autoCapitalize="sentences"
          autoCorrect="on"
          className={`${STYLES.control} ${STYLES.textarea}`}
        />
      ) : (
        <Input
          type="text"
          enterKeyHint="next"
          autoCapitalize="words"
          autoCorrect="on"
          autoComplete={props.autoComplete}
          className={STYLES.control}
        />
      )}

      <FieldError className={STYLES.error}>{props.errorMessage}</FieldError>
    </TextField>
  );
}
