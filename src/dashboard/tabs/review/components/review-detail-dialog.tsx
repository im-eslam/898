import { Button } from "react-aria-components";
import type { ReviewDto } from "@api/contracts";
import { useLocale, useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { formatCreatedAt } from "../lib/format-date";
import { strings } from "../strings";
import { ResponsiveDialog } from "./responsive-dialog";

const STYLES = {
  details: "flex flex-col gap-5",
  meta: "flex flex-col gap-1",
  contact: "break-words text-small text-charcoal/85",
  date: "text-caption text-charcoal/75",
  message: "whitespace-pre-line break-words rounded-lg bg-white p-4 text-body leading-relaxed text-charcoal",
  actions: "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
  fullWidthOnPhone: "w-full sm:w-auto",
} as const;

interface ReviewDetailDialogProps {
  review: ReviewDto | null;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function ReviewDetailDialog({ review, isDeleting, onClose, onDelete }: ReviewDetailDialogProps) {
  const s = useStrings(strings);
  const locale = useLocale();

  return (
    <ResponsiveDialog
      isOpen={review !== null}
      isDismissable={!isDeleting}
      title={review ? review.name || s.review.anonymous : ""}
      closeLabel={s.dialog.close}
      onClose={onClose}
    >
      {review && (
        <div className={STYLES.details}>
          <div className={STYLES.meta}>
            <p className={STYLES.contact}>{review.contact || s.review.noContact}</p>
            <p className={STYLES.date}>{formatCreatedAt(review.created_at, locale)}</p>
          </div>
          <p className={STYLES.message}>{review.message}</p>
          <div className={STYLES.actions}>
            <Button
              isDisabled={isDeleting}
              onPress={onDelete}
              className={`${CONTROL_STYLES.buttonDanger} ${STYLES.fullWidthOnPhone}`}
            >
              {s.dialog.delete}
            </Button>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}
