import { useState } from "react";
import {
  Button,
  FieldError,
  Input,
  Label,
  Text,
  TextField,
} from "react-aria-components";

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

function PasswordIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {visible ? (
        <>
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <path d="M2 2l20 20" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

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
          <PasswordIcon visible={visible} />
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
