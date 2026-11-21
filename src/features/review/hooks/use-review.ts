import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ROUTES, useLocation } from "@/shared/router";
import { useStrings } from "@/shared/i18n";
import { toErrorKey, type ErrorKey } from "@/shared/api";
import { submitReview, type ReviewPayload } from "../api/review";
import { GOOGLE_REVIEW_URL, REVIEW_LIMITS } from "../data";
import { strings } from "../strings";

type Step = "choices" | "note" | "success";
type ReviewError = keyof typeof strings.en.form.errors;
type ValidationResult = "required" | "tooShort" | null;

const ERROR_MAP: Record<ErrorKey, ReviewError> = {
  INVALID_INPUT: "invalid-input",
  PAYLOAD_TOO_LARGE: "invalid-input",
  RATE_LIMITED: "rate-limited",
  HTTP_ERROR: "server",
  INTERNAL_ERROR: "server",
  TIMEOUT: "timeout",
  NOT_FOUND: "unknown",
  INVALID_CREDENTIALS: "unknown",
  UNAUTHORIZED: "unknown",
  NETWORK: "unknown",
  UNKNOWN: "unknown",
};

class ReviewForm {
  static extract(formData: FormData): ReviewPayload {
    return {
      message: String(formData.get("message") ?? ""),
      name: String(formData.get("name") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      website: String(formData.get("website") ?? ""),
    };
  }

  static checkMessage(value: string): ValidationResult {
    const length = [...value.trim()].length;
    if (length === 0) return "required";
    if (length < REVIEW_LIMITS.message.min) return "tooShort";
    return null;
  }
}

function mapStrings(s: typeof strings.en) {
  return {
    requiredMessage: s.form.validation.required,
    tooShortMessage: s.form.validation.tooShort,
  };
}

export function useReview() {
  const { requiredMessage, tooShortMessage } = mapStrings(useStrings(strings));
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("choices");
  const mutation = useMutation({ mutationFn: submitReview });

  const close = () => {
    setStep("choices");
    mutation.reset();
    if (location !== ROUTES.landing) setLocation(ROUTES.landing);
  };

  const openGoogleReview = () => {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    close();
  };

  const submit = async (formData: FormData) => {
    try {
      await mutation.mutateAsync(ReviewForm.extract(formData));
      setStep("success");
    } catch {
      void 0;
    }
  };

  const validateMessage = (value: string) => {
    const result = ReviewForm.checkMessage(value);
    if (result === "required") return requiredMessage;
    if (result === "tooShort") return tooShortMessage;
    return true;
  };

  return {
    isOpen: location === ROUTES.review,
    step,
    chooseNote: () => setStep("note"),
    close,
    openGoogleReview,
    submit,
    validateMessage,
    sending: mutation.isPending,
    submitError: mutation.error ? ERROR_MAP[toErrorKey(mutation.error)] : null,
  };
}
