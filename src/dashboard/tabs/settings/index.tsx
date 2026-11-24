import toast from "react-hot-toast";
import { ADMIN_LIMITS, type AdminDto } from "@api/contracts";
import type { ErrorKey } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { useSession } from "../../hooks/use-session";
import {
  type SettingsSection,
  useTabSettings,
} from "../../hooks/use-tab-settings";
import { LanguageField } from "./components/language-field";
import { PasswordField } from "./components/password-field";
import { SettingsCard } from "./components/settings-card";
import { TextField } from "./components/text-field";
import { strings } from "./strings";

const STYLES = {
  page: "flex w-full max-w-2xl flex-col gap-6",
  title: "text-title font-bold text-balance text-navy",
} as const;

type ToastStrings = (typeof strings.en)["toast"];

function saveErrorMessage(messages: ToastStrings, code: ErrorKey | null) {
  switch (code) {
    case "INVALID_CREDENTIALS":
      return messages.invalidCredentials;
    case "USERNAME_TAKEN":
      return messages.usernameTaken;
    case "INVALID_INPUT":
      return messages.invalidInput;
    case "UNAUTHORIZED":
      return messages.unauthorized;
    case "NETWORK":
      return messages.network;
    case "TIMEOUT":
      return messages.timeout;
    default:
      return messages.server;
  }
}

function SettingsPanel({ admin }: { admin: AdminDto }) {
  const s = useStrings(strings);
  const settings = useTabSettings(admin);
  const { values, setField, isDirty, isSaving } = settings;

  const handleSave = async (section: SettingsSection) => {
    const result = await settings.save(section);
    if (result.ok) toast.success(s.toast.saved[section]);
    else toast.error(saveErrorMessage(s.toast, result.code));
  };

  const cardProps = (section: SettingsSection) => ({
    isDisabled: !isDirty[section],
    isSaving,
    saveLabel: s.actions.save,
    savingLabel: s.actions.saving,
    onSave: () => void handleSave(section),
  });

  return (
    <section className={STYLES.page}>
      <h1 className={STYLES.title}>{s.title}</h1>

      <SettingsCard title={s.sections.language} {...cardProps("language")}>
        <LanguageField
          label={s.fields.language}
          options={s.languages}
          value={values.language}
          onChange={(language) => setField("language", language)}
        />
      </SettingsCard>

      <SettingsCard title={s.sections.username} {...cardProps("username")}>
        <TextField
          name="username"
          label={s.fields.username}
          description={s.hints.username}
          value={values.username}
          onChange={(username) => setField("username", username)}
          isRequired
          minLength={ADMIN_LIMITS.username.min}
          maxLength={ADMIN_LIMITS.username.max}
          pattern={ADMIN_LIMITS.username.pattern.source}
          autoComplete="username"
          spellCheck="false"
        />
        <PasswordField
          name="usernameCurrentPassword"
          label={s.fields.usernameCurrentPassword}
          description={s.hints.usernameCurrentPassword}
          showLabel={s.showPassword}
          hideLabel={s.hidePassword}
          value={values.usernameCurrentPassword}
          onChange={(usernameCurrentPassword) =>
            setField("usernameCurrentPassword", usernameCurrentPassword)
          }
          isRequired
          autoComplete="current-password"
        />
      </SettingsCard>

      <SettingsCard title={s.sections.password} {...cardProps("password")}>
        <PasswordField
          name="currentPassword"
          label={s.fields.currentPassword}
          description={s.hints.currentPassword}
          showLabel={s.showPassword}
          hideLabel={s.hidePassword}
          value={values.currentPassword}
          onChange={(currentPassword) =>
            setField("currentPassword", currentPassword)
          }
          isRequired
          autoComplete="current-password"
        />
        <PasswordField
          name="newPassword"
          label={s.fields.newPassword}
          description={s.hints.newPassword}
          showLabel={s.showPassword}
          hideLabel={s.hidePassword}
          value={values.newPassword}
          onChange={(newPassword) => setField("newPassword", newPassword)}
          isRequired
          minLength={ADMIN_LIMITS.password.min}
          maxLength={ADMIN_LIMITS.password.max}
          autoComplete="new-password"
        />
        <PasswordField
          name="confirmPassword"
          label={s.fields.confirmPassword}
          showLabel={s.showPassword}
          hideLabel={s.hidePassword}
          value={values.confirmPassword}
          onChange={(confirmPassword) =>
            setField("confirmPassword", confirmPassword)
          }
          isRequired
          autoComplete="new-password"
          validate={(value) =>
            value === values.newPassword || s.validation.passwordMismatch
          }
        />
      </SettingsCard>
    </section>
  );
}

export function SettingsTab() {
  const { admin } = useSession();
  if (!admin) return null;
  return <SettingsPanel admin={admin} />;
}
