import { Input, Label, Text, TextArea, TextField } from "react-aria-components";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

interface FormTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  rules?: RegisterOptions<T, FieldPath<T>>;
  kind: "input" | "textarea";
  label: string;
  hint?: string;
  maxLength: number;
  required?: boolean;
  autoComplete?: string;
}

const STYLES = {
  wrapper: "group flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  control:
    "w-full rounded-md border border-navy/15 bg-white px-4 py-3 text-body text-navy placeholder:text-navy/40 outline-none transition-colors duration-interactive ease-smooth data-focused:border-brand data-invalid:border-error data-invalid:bg-error/5 motion-reduce:transition-none",
  textarea: "min-h-32 resize-y",
  hint: "text-caption text-navy/65",
  error: "text-caption text-error",
} as const;

export function FormTextField<T extends FieldValues>(
  props: FormTextFieldProps<T>
) {
  const { kind, maxLength, autoComplete } = props;
  const { field, fieldState } = useController({
    control: props.control,
    name: props.name,
    rules: props.rules,
  });
  const error = fieldState.error?.message;

  return (
    <TextField
      value={String(field.value ?? "")}
      onChange={field.onChange}
      onBlur={field.onBlur}
      isRequired={props.required}
      isInvalid={Boolean(error)}
      className={STYLES.wrapper}
    >
      <Label className={STYLES.label}>{props.label}</Label>

      {kind === "textarea" ? (
        <TextArea
          maxLength={maxLength}
          rows={5}
          dir="auto"
          className={`${STYLES.control} ${STYLES.textarea}`}
        />
      ) : (
        <Input
          maxLength={maxLength}
          autoComplete={autoComplete}
          dir="auto"
          className={STYLES.control}
        />
      )}

      {props.hint && !error && (
        <Text slot="description" className={STYLES.hint}>
          {props.hint}
        </Text>
      )}
      {error && (
        <Text slot="errorMessage" className={STYLES.error}>
          {error}
        </Text>
      )}
    </TextField>
  );
}
