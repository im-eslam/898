import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { REVIEW_LIMITS } from "./data";
import { Drawer } from "./components/shell/drawer";
import { ChoiceCard } from "./components/ui/choice-card";
import { FormTextField } from "./components/ui/form-text-field";
import { strings } from "./strings";
import { useReview } from "./hooks/use-review";

const STYLES = {
  choices: "flex flex-col gap-3 pb-4 animate-reveal-in",
  form: "flex flex-col gap-5 pb-2 animate-reveal-in",
  error:
    "text-small rounded-md border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  submit:
    "text-small mt-2 min-h-12 rounded-full bg-brand px-6 text-center font-bold text-white outline-none transition duration-interactive ease-smooth data-focus-visible:ring-2 data-focus-visible:ring-brand data-focus-visible:ring-offset-2 data-hovered:bg-brand/90 [@media(hover:hover)_and_(pointer:fine)]:data-pressed:scale-[0.98] data-disabled:opacity-50 data-disabled:transition-none motion-reduce:transition-none",
  honeypot: "sr-only",
  success:
    "flex flex-col items-center gap-4 py-8 text-center animate-reveal-in",
  successBubble:
    "flex size-16 items-center justify-center rounded-full bg-success text-white",
  successIcon: "size-8",
  successMessage: "text-heading mt-2 font-bold text-navy text-balance",
  successButton:
    "text-small mt-4 min-h-12 w-full rounded-full bg-brand px-8 text-center font-bold text-white outline-none transition duration-interactive ease-smooth data-focus-visible:ring-2 data-focus-visible:ring-brand data-focus-visible:ring-offset-2 data-hovered:bg-brand/90 [@media(hover:hover)_and_(pointer:fine)]:data-pressed:scale-[0.98] motion-reduce:transition-none",
} as const;

export function ReviewPage() {
  const s = useStrings(strings);
  const review = useReview();

  return (
    <Drawer
      strings={{
        closeLabel: s.common.close,
        title: review.step === "note" ? s.choices.note.title : s.drawer.title,
        description: s.drawer.description,
      }}
      isOpen={review.isOpen}
      onClose={review.close}
    >
      {review.step === "choices" && (
        <section className={STYLES.choices}>
          <ChoiceCard
            strings={{
              icon: "star",
              title: s.choices.google.title,
              hint: s.choices.google.hint,
            }}
            onPress={review.openGoogleReview}
          />
          <ChoiceCard
            strings={{
              icon: "chat",
              title: s.choices.note.title,
              hint: s.choices.note.hint,
            }}
            onPress={review.chooseNote}
          />
        </section>
      )}

      {review.step === "note" && (
        <form noValidate className={STYLES.form} onSubmit={review.submit}>
          <FormTextField
            control={review.control}
            name="message"
            kind="textarea"
            label={s.form.fields.message.label}
            rules={{
              validate: (value) =>
                review.messageRules.validate(value ?? ""),
            }}
            maxLength={REVIEW_LIMITS.message}
            required
          />
          <FormTextField
            control={review.control}
            name="name"
            kind="input"
            label={s.form.fields.name.label}
            maxLength={REVIEW_LIMITS.name}
            autoComplete="name"
          />
          <FormTextField
            control={review.control}
            name="contact"
            kind="input"
            label={s.form.fields.contact.label}
            maxLength={REVIEW_LIMITS.contact}
          />

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className={STYLES.honeypot}
            {...review.register("website")}
          />

          {review.submitError && (
            <p role="alert" className={STYLES.error}>
              {s.form.errors[review.submitError]}
            </p>
          )}

          <Button
            type="submit"
            isDisabled={!review.canSubmit}
            className={STYLES.submit}
          >
            {review.sending ? s.form.actions.sending : s.form.actions.send}
          </Button>
        </form>
      )}

      {review.step === "success" && (
        <section className={STYLES.success}>
          <span className={STYLES.successBubble}>
            <Icon name="check" className={STYLES.successIcon} />
          </span>
          <p className={STYLES.successMessage}>{s.success.message}</p>
          <Button onPress={review.close} className={STYLES.successButton}>
            {s.common.close}
          </Button>
        </section>
      )}
    </Drawer>
  );
}
