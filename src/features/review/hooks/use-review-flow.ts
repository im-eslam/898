import { useState } from "react";
import { ROUTES, useLocation } from "@/shared/router";

export type ReviewStep = "choices" | "note" | "success";

export function useReviewFlow() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<ReviewStep>("choices");

  const close = () => {
    setStep("choices");
    if (location !== ROUTES.landing) setLocation(ROUTES.landing);
  };

  return {
    isOpen: location === ROUTES.review,
    step,
    chooseNote: () => setStep("note"),
    showSuccess: () => setStep("success"),
    close,
  };
}
