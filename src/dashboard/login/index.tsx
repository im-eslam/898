import { useState } from "react";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import logo from "@/assets/mark.svg";
import type { ErrorKey } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { useSignIn } from "../hooks/use-sign-in";
import { strings } from "./strings";

const INPUT_BASE =
  "w-full rounded-md border border-navy/15 bg-white py-3 ps-4 text-body text-navy outline-none transition-colors ease-smooth focus:border-brand";
const STYLES = {
  page: "flex min-h-dvh items-center justify-center bg-cream px-6 py-12 text-charcoal",
  content: "flex w-full max-w-sm flex-col items-center text-center",
  logo: "mb-6 h-auto w-20",
  title: "text-title font-bold text-balance text-navy",
  form: "mt-8 flex w-full flex-col gap-5 text-start",
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  input: `${INPUT_BASE} pe-4`,
  passwordWrap: "relative",
  passwordInput: `${INPUT_BASE} pe-12`,
  toggle:
    "absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-md text-navy/60 outline-none transition-colors ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [@media(hover:hover)_and_(pointer:fine)]:hover:text-navy",
  error:
    "text-small rounded-md border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  submit:
    "mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-small font-bold text-white transition-colors ease-smooth [@media(hover:hover)_and_(pointer:fine)]:hover:bg-navy active:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-disabled:opacity-50",
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

export function LoginPage() {
  const s = useStrings(strings);

  const { signIn, isPending, errorCode, clearError } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const getErrorMessage = (error: ErrorKey): string => {
    switch (error) {
      case "INVALID_CREDENTIALS":
        return s.errors.invalidCredentials;
      case "PAYLOAD_TOO_LARGE":
        return s.errors.tooLarge;
      case "NETWORK":
        return s.errors.network;
      case "TIMEOUT":
        return s.errors.timeout;
      default:
        return s.errors.server;
    }
  };

  return (
    <main className={STYLES.page}>
      <div className={STYLES.content}>
        <img src={logo} alt="" className={STYLES.logo} />
        <h1 className={STYLES.title}>{s.heading}</h1>

        <Form
          validationBehavior="native"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            signIn(
              String(form.get("username") ?? ""),
              String(form.get("password") ?? "")
            );
          }}
          className={STYLES.form}
        >
          <TextField
            name="username"
            autoFocus
            isRequired
            onChange={clearError}
            className={STYLES.field}
          >
            <Label className={STYLES.label}>{s.fields.username}</Label>
            <Input
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              dir="ltr"
              className={STYLES.input}
            />
          </TextField>

          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            isRequired
            onChange={clearError}
            className={STYLES.field}
          >
            <Label className={STYLES.label}>{s.fields.password}</Label>
            <div dir="ltr" className={STYLES.passwordWrap}>
              <Input
                autoComplete="current-password"
                dir="ltr"
                className={STYLES.passwordInput}
              />
              <Button
                onPress={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword ? s.passwordToggle.hide : s.passwordToggle.show
                }
                className={STYLES.toggle}
              >
                <PasswordIcon visible={showPassword} />
              </Button>
            </div>
          </TextField>

          {errorCode && (
            <p role="alert" className={STYLES.error}>
              {getErrorMessage(errorCode)}
            </p>
          )}

          <Button
            type="submit"
            isDisabled={isPending}
            className={STYLES.submit}
          >
            {isPending ? s.actions.submitting : s.actions.submit}
          </Button>
        </Form>
      </div>
    </main>
  );
}
