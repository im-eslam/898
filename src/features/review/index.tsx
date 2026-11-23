import { Button, type ValidationResult } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { ErrorKey } from "@/shared/api";
import { REVIEW_LIMITS } from "./data";
import { ReviewDrawer } from "./components/shell/review-drawer";
import { ChoiceCard } from "./components/ui/choice-card";
import { FormTextField } from "./components/ui/form-text-field";
import { strings } from "./strings";
import { useReview } from "./hooks/use-review";

const STYLES = {
  choices: "flex flex-col gap-3 pb-4",
  form: "flex flex-col gap-5 pb-2",
  error:
    "text-small rounded-md border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  submit:
    "text-small mt-2 min-h-12 rounded-full bg-brand px-6 text-center font-bold text-white outline-none transition duration-interactive ease-smooth data-focus-visible:ring-2 data-focus-visible:ring-brand data-focus-visible:ring-offset-2 data-hovered:bg-brand/90 [@media(hover:hover)_and_(pointer:fine)]:data-pressed:scale-[0.98] data-disabled:opacity-50 data-disabled:transition-none",
  honeypot: "sr-only",
  success:
    "flex flex-col items-center gap-4 py-8 text-center",
  successBubble:
    "flex size-16 items-center justify-center rounded-full bg-success text-white",
  successIcon: "size-8",
  successMessage: "text-heading mt-2 font-bold text-navy text-balance",
  successButton:
    "text-small mt-4 min-h-12 w-full rounded-full bg-brand px-8 text-center font-bold text-white outline-none transition duration-interactive ease-smooth data-focus-visible:ring-2 data-focus-visible:ring-brand data-focus-visible:ring-offset-2 data-hovered:bg-brand/90 [@media(hover:hover)_and_(pointer:fine)]:data-pressed:scale-[0.98]",
} as const;

export function ReviewPage() {
  const s = useStrings(strings);
  const review = useReview();

  const getValidationMessage = (v: ValidationResult): string =>
    v.validationDetails.valueMissing
      ? s.form.validation.required
      : s.form.validation.tooShort;

  const getErrorMessage = (error: ErrorKey): string => {
    switch (error) {
      case "INVALID_INPUT":
      case "PAYLOAD_TOO_LARGE":
        return s.form.errors.invalidInput;
      case "TIMEOUT":
        return s.form.errors.timeout;
      case "NETWORK":
        return s.form.errors.network;
      case "HTTP_ERROR":
      case "INTERNAL_ERROR":
        return s.form.errors.server;
      case "NOT_FOUND":
      case "INVALID_CREDENTIALS":
      case "UNAUTHORIZED":
      case "UNKNOWN":
      case "UNAVAILABLE":
        return s.form.errors.unknown;
    }
  };

  return (
    <ReviewDrawer
      strings={{
        title:
          review.step === "note"
            ? s.choices.note.title
            : review.step === "success"
              ? s.success.title
              : s.drawer.title,
        description: s.drawer.description,
      }}
      isOpen={review.isOpen}
      hideHeader={review.step === "success"}
      isCloseDisabled={review.sending}
      onClose={review.close}
    >
      {review.step === "choices" && (
        <section className={STYLES.choices}>
          <ChoiceCard
            icon="star"
            strings={{
              title: s.choices.google.title,
              hint: s.choices.google.hint,
            }}
            onPress={review.openGoogleReview}
          />
          <ChoiceCard
            icon="chat"
            strings={{
              title: s.choices.note.title,
              hint: s.choices.note.hint,
            }}
            onPress={review.chooseNote}
          />
        </section>
      )}

      {review.step === "note" && (
        <form
          onChange={review.onEdit}
          onSubmit={(e) => {
            e.preventDefault();
            review.submit(new FormData(e.currentTarget));
          }}
          className={STYLES.form}
        >
          <FormTextField
            name="message"
            kind="textarea"
            autoFocus
            isRequired
            label={s.form.fields.message.label}
            minLength={REVIEW_LIMITS.message.min}
            maxLength={REVIEW_LIMITS.message.max}
            errorMessage={getValidationMessage}
          />
          <FormTextField
            name="name"
            kind="input"
            label={s.form.fields.name.label}
            maxLength={REVIEW_LIMITS.name.max}
            autoComplete="name"
          />
          <FormTextField
            name="contact"
            kind="input"
            label={s.form.fields.contact.label}
            maxLength={REVIEW_LIMITS.contact.max}
          />

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            aria-hidden="true"
            className={STYLES.honeypot}
          />

          {review.error && (
            <p role="alert" className={STYLES.error}>
              {getErrorMessage(review.error)}
            </p>
          )}

          <Button
            type="submit"
            isDisabled={review.sending}
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
    </ReviewDrawer>
  );
}
