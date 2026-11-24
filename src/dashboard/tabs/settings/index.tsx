import type { FormEvent } from "react";
import { Button, Form } from "react-aria-components";
import toast from "react-hot-toast";
import { ADMIN_LANGUAGES, type AdminDto } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { useSession } from "../../hooks/use-session";
import { LanguageInput } from "./components/language-input";
import { PasswordInput } from "./components/password-input";
import { TextInput } from "./components/text-input";
import { useAccountForm, type AccountField } from "./hooks/use-account-form";
import { strings } from "./strings";

const STYLES = {
  page: "mx-auto flex w-full max-w-md flex-col items-center text-center",
  title: "text-title font-bold text-balance text-navy",
  description: "mt-2 text-body text-balance text-navy/80",
  form: "mt-8 flex w-full flex-col gap-8 text-start",
  error:
    "text-small rounded-md border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  submit:
    "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-small font-bold text-white transition-colors ease-smooth [@media(hover:hover)_and_(pointer:fine)]:hover:bg-navy active:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-disabled:opacity-50",
} as const;

export function SettingsTab() {
  const s = useStrings(strings);

  const { admin } = useSession();
  if (!admin) return null;

  return (
    <section className={STYLES.page}>
      <h1 className={STYLES.title}>{s.title}</h1>
      <p className={STYLES.description}>{s.description}</p>
      <SettingsForm admin={admin} />
    </section>
  );
}

function SettingsForm({ admin }: { admin: AdminDto }) {
  const s = useStrings(strings);
  const form = useAccountForm(admin);

  const getErrorMessage = (code: string): string =>
    Object.hasOwn(s.errors, code)
      ? s.errors[code as keyof typeof s.errors]
      : s.errors.UNKNOWN;

  const fieldError = (field: AccountField): string | undefined =>
    form.failedField === field && form.errorCode
      ? getErrorMessage(form.errorCode)
      : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sent = form.save(() => toast.success(s.form.saved));
    if (!sent) toast(s.form.noChanges);
  };

  return (
    <Form onSubmit={handleSubmit} className={STYLES.form}>
      <LanguageInput
        label={s.account.language.label}
        value={form.draft.language}
        options={ADMIN_LANGUAGES}
        labels={{ en: s.account.language.en, ar: s.account.language.ar }}
        onChange={(language) => form.update({ language })}
      />

      <TextInput
        name="username"
        label={s.account.username}
        hint={s.account.usernameHint}
        value={form.draft.username}
        onChange={(username) => form.update({ username })}
        autoComplete="username"
        error={fieldError("username")}
      />

      <PasswordInput
        name="newPassword"
        label={s.password.new}
        hint={s.password.newHint}
        value={form.draft.newPassword}
        onChange={(newPassword) => form.update({ newPassword })}
        autoComplete="new-password"
        showLabel={s.password.show}
        hideLabel={s.password.hide}
        error={fieldError("newPassword")}
      />

      <PasswordInput
        name="currentPassword"
        label={s.current.label}
        hint={s.current.hint}
        value={form.draft.currentPassword}
        onChange={(currentPassword) => form.update({ currentPassword })}
        autoComplete="current-password"
        showLabel={s.password.show}
        hideLabel={s.password.hide}
        error={fieldError("currentPassword")}
      />

      {form.generalError && (
        <p role="alert" className={STYLES.error}>
          {getErrorMessage(form.generalError)}
        </p>
      )}

      <Button
        type="submit"
        isDisabled={form.isPending}
        className={STYLES.submit}
      >
        {form.isPending ? s.actions.saving : s.actions.save}
      </Button>
    </Form>
  );
}
