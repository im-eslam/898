import { useState } from "react";
import { Button, FileTrigger } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { FIELD, FOCUS_RING, SPINNER } from "../../control-styles";
import { ImageError, isPhotoFile, prepareImage } from "../../lib/image-file";
import { strings } from "../../strings";

interface ImageFieldProps {
  label: string;
  previewUrl: string | null;
  isPending: boolean;
  pendingLabel: string;
  onSelect: (file: File) => void;
  selectLabel: string;
  changeLabel: string;
  hint?: string;
  error?: string;
  variant?: "square" | "poster";
}

const STYLES = {
  field: "flex flex-col gap-2",
  row: {
    square: "flex flex-col gap-3 @sm:flex-row @sm:items-end",
    poster: "flex flex-col gap-3",
  },
  frame: {
    square: "size-36 @sm:size-40",
    poster: "aspect-[4/5] w-full max-w-64",
  },
  // The whole frame is the tap target.
  button: `group relative flex shrink-0 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-cream p-3 text-center text-navy transition-colors ease-smooth ${FOCUS_RING} data-disabled:cursor-progress`,
  buttonEmpty: "border-dashed border-navy/30 hover:border-brand",
  buttonFilled: "border-navy/15",
  image: "absolute inset-0 size-full object-cover",
  changeChip:
    "absolute inset-x-2 bottom-2 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-caption font-bold text-navy",
  emptyText: "text-small font-bold text-navy",
  info: "flex min-w-0 flex-col items-start gap-2",
  pending: "inline-flex items-center rounded-full bg-honey/25 px-3 py-1 text-caption font-bold text-navy",
} as const;

// Picking a photo shows it straight away. Large photos are resized here first, and
// the parent saves the file when the user presses Save.
export function ImageField({
  label,
  previewUrl,
  isPending,
  pendingLabel,
  onSelect,
  selectLabel,
  changeLabel,
  hint,
  error,
  variant = "square",
}: ImageFieldProps) {
  const s = useStrings(strings);
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const shownError = localError ?? error;
  const isFilled = previewUrl !== null;

  const handleFiles = async (files: FileList | null) => {
    const picked = files?.[0];
    if (!picked) return;

    setLocalError(undefined);
    if (!isPhotoFile(picked)) {
      setLocalError(s.common.imageNotPhoto);
      return;
    }

    setIsProcessing(true);
    try {
      onSelect(await prepareImage(picked));
    } catch (caught) {
      const isType = caught instanceof ImageError && caught.reason === "type";
      setLocalError(isType ? s.common.imageNotPhoto : s.common.imageUnreadable);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={STYLES.field}>
      <span className={FIELD.label}>{label}</span>
      <div className={STYLES.row[variant]}>
        <FileTrigger acceptedFileTypes={["image/*"]} onSelect={(files) => void handleFiles(files)}>
          <Button
            isDisabled={isProcessing}
            className={`${STYLES.button} ${STYLES.frame[variant]} ${isFilled ? STYLES.buttonFilled : STYLES.buttonEmpty}`}
          >
            {isProcessing ? (
              <>
                <span className={SPINNER} />
                <span className={STYLES.emptyText}>{s.common.preparingImage}</span>
              </>
            ) : previewUrl ? (
              <>
                <img src={previewUrl} alt="" loading="lazy" decoding="async" className={STYLES.image} />
                <span className={STYLES.changeChip}>{changeLabel}</span>
              </>
            ) : (
              <>
                <Icon name="cup" size={28} className="text-brand" />
                <span className={STYLES.emptyText}>{selectLabel}</span>
              </>
            )}
          </Button>
        </FileTrigger>
        <div className={STYLES.info}>
          {isPending && <span className={STYLES.pending}>{pendingLabel}</span>}
          {hint && <span className={FIELD.hint}>{hint}</span>}
        </div>
      </div>
      {shownError && (
        <p role="alert" className={FIELD.error}>
          {shownError}
        </p>
      )}
    </div>
  );
}
