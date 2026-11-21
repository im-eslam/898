import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useStrings } from "@/shared/i18n";
import {
  submitReview,
  getReviewError,
  type ReviewPayload,
} from "../api/review";
import { REVIEW_LIMITS } from "../data";
import { strings } from "../strings";

const EMPTY_REVIEW: ReviewPayload = {
  message: "",
  name: "",
  contact: "",
  website: "",
};

export function useReviewForm(onSent: () => void) {
  const s = useStrings(strings);

  const { control, register, handleSubmit, reset, formState } =
    useForm<ReviewPayload>({
      mode: "onChange",
      defaultValues: EMPTY_REVIEW,
    });

  const mutation = useMutation({
    mutationFn: submitReview,
    onSuccess: onSent,
  });

  return {
    control,
    register,
    messageRules: {
      validate: (value: string) =>
        value.trim().length >= REVIEW_LIMITS.minMessage ||
        s.form.validation.tooShort,
    },
    submitError: mutation.error ? getReviewError(mutation.error) : null,
    sending: mutation.isPending,
    canSubmit: formState.isValid && !mutation.isPending,
    submit: handleSubmit((values) => mutation.mutate(values)),
    reset: () => {
      reset(EMPTY_REVIEW);
      mutation.reset();
    },
  };
}
