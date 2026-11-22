import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ROUTES, useLocation } from "@/shared/router";
import { ApiError } from "@/shared/api/data";
import { submitReview } from "../api/review";
import { GOOGLE_REVIEW_URL } from "../data";

type Step = "choices" | "note" | "success";

export function useReview() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("choices");

  const mutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => setStep("success"),
  });

  const chooseNote = () => {
    mutation.reset();
    setStep("note");
  };

  const close = () => {
    setStep("choices");
    mutation.reset();
    if (location !== ROUTES.landing) {
      setLocation(ROUTES.landing);
    }
  };

  const openGoogleReview = () => {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    close();
  };

  const submit = (formData: FormData) => {
    if (mutation.isPending) return;
    mutation.mutate({
      message: String(formData.get("message") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      contact: String(formData.get("contact") ?? "").trim(),
      website: String(formData.get("website") ?? ""),
    });
  };

  return {
    isOpen: location === ROUTES.review,
    step,
    chooseNote,
    close,
    openGoogleReview,
    submit,
    clearError: mutation.reset,
    sending: mutation.isPending,
    error: (mutation.error as ApiError | null)?.code ?? null,
  };
}
