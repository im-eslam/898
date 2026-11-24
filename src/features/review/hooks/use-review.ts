import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Ok } from "@api/contracts";
import { ROUTES, useLocation } from "@/shared/router";
import type { ApiError } from "@/shared/api/";
import { submitReview, type ReviewPayload } from "../api/review";
import { GOOGLE_REVIEW_URL } from "../data";

type Step = "choices" | "note" | "success";

export function useReview() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("choices");

  const inFlight = useRef(false);

  const mutation = useMutation<Ok, ApiError, ReviewPayload>({
    mutationFn: submitReview,
    onSuccess: () => setStep("success"),
    onSettled: () => {
      inFlight.current = false;
    },
  });

  const close = () => {
    if (inFlight.current) return;
    setStep("choices");
    mutation.reset();
    if (location !== ROUTES.landing) setLocation(ROUTES.landing);
  };

  const openGoogleReview = () => {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    close();
  };

  const submit = (formData: FormData) => {
    if (inFlight.current) return;

    inFlight.current = true;
    mutation.mutate({
      message: String(formData.get("message") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      contact: String(formData.get("contact") ?? "").trim(),
      website: String(formData.get("website") ?? ""),
    });
  };

  const onEdit = () => {
    if (mutation.error) mutation.reset();
  };

  return {
    isOpen: location === ROUTES.review,
    step,
    chooseNote: () => setStep("note"),
    close,
    openGoogleReview,
    submit,
    onEdit,
    sending: mutation.isPending,
    error: mutation.error?.code ?? null,
  };
}
