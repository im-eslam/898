import { useState } from "react";
import {
  Button,
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";
import { Icon } from "@/shared/icons";

interface PasswordInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  hint?: string;
  error?: string;
  showLabel: string;
  hideLabel: string;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  wrapper: "relative",
  input:
    "w-full rounded-md border border-navy/15 bg-white py-3 ps-4 pe-12 text-body text-navy outline-none transition-colors ease-smooth focus:border-brand data-invalid:border-error",
  toggle:
    "absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-md text-navy/60 outline-none transition-colors ease-smooth hover:text-navy data-focus-visible:outline-2 data-focus-visible:outline-brand",
  hint: "text-caption text-navy/70",
  error: "text-small font-bold text-error",
} as const;

export function PasswordInput({
  name,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
  showLabel,
  hideLabel,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      name={name}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      className={STYLES.field}
    >
      <Label className={STYLES.label}>{label}</Label>
      <div className={STYLES.wrapper}>
        <Input autoComplete={autoComplete} dir="ltr" className={STYLES.input} />
        <Button
          aria-label={visible ? hideLabel : showLabel}
          onPress={() => setVisible((v) => !v)}
          className={STYLES.toggle}
        >
          <Icon name="eye" size={20} />
        </Button>
      </div>
      {hint && (
        <Text slot="description" className={STYLES.hint}>
          {hint}
        </Text>
      )}
      <FieldError className={STYLES.error}>{error}</FieldError>
    </TextField>
  );
}
