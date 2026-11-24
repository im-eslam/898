import type { ReactNode } from "react";
import { Button, Form } from "react-aria-components";

const STYLES = {
  card: "flex flex-col gap-6 rounded-lg border border-sand/60 bg-paper p-5 shadow-card md:p-6",
  title: "text-heading font-bold text-navy",
  fields: "flex flex-col gap-5",
  footer: "mt-auto flex justify-end border-t border-sand/60 pt-5",
  submit:
    "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-small font-bold text-white transition-colors ease-smooth [@media(hover:hover)_and_(pointer:fine)]:hover:bg-navy active:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-disabled:opacity-50 sm:w-auto",
} as const;

interface SettingsCardProps {
  title: string;
  children: ReactNode;
  saveLabel: string;
  savingLabel: string;
  isDisabled: boolean;
  isSaving: boolean;
  onSave: () => void;
}

// One section of the settings page: its own fields, its own save button.
export function SettingsCard({
  title,
  children,
  saveLabel,
  savingLabel,
  isDisabled,
  isSaving,
  onSave,
}: SettingsCardProps) {
  return (
    <Form
      validationBehavior="native"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className={STYLES.card}
    >
      <h2 className={STYLES.title}>{title}</h2>
      <div className={STYLES.fields}>{children}</div>
      <footer className={STYLES.footer}>
        <Button
          type="submit"
          isDisabled={isDisabled || isSaving}
          className={STYLES.submit}
        >
          {isSaving ? savingLabel : saveLabel}
        </Button>
      </footer>
    </Form>
  );
}