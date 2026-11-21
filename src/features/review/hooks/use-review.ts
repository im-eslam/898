import { GOOGLE_REVIEW_URL } from "../data";
import { useReviewFlow } from "./use-review-flow";
import { useReviewForm } from "./use-review-form";

export function useReview() {
  const flow = useReviewFlow();
  const form = useReviewForm(flow.showSuccess);

  const close = () => {
    form.reset();
    flow.close();
  };

  const openGoogleReview = () => {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    close();
  };

  return {
    isOpen: flow.isOpen,
    step: flow.step,
    chooseNote: flow.chooseNote,
    close,
    openGoogleReview,
    control: form.control,
    register: form.register,
    messageRules: form.messageRules,
    submit: form.submit,
    submitError: form.submitError,
    sending: form.sending,
    canSubmit: form.canSubmit,
  };
}
