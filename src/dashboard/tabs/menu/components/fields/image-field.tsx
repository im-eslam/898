import { Button, FileTrigger } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../../control-styles";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageFieldProps {
  label: string;
  previewUrl: string | null;
  onSelect: (file: File) => void;
  selectLabel: string;
  changeLabel: string;
  hint?: string;
  error?: string;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  row: "flex items-center gap-4",
  preview:
    "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-navy/15 bg-cream text-navy/30",
  image: "size-full object-cover",
  actions: "flex min-w-0 flex-col items-start gap-1",
  hint: "text-caption text-navy/60",
  error: "text-small font-bold text-error",
} as const;

export function ImageField({
  label,
  previewUrl,
  onSelect,
  selectLabel,
  changeLabel,
  hint,
  error,
}: ImageFieldProps) {
  return (
    <div className={STYLES.field}>
      <span className={STYLES.label}>{label}</span>
      <div className={STYLES.row}>
        <div className={STYLES.preview}>
          {previewUrl ? (
            <img src={previewUrl || "/placeholder.svg"} alt="" className={STYLES.image} />
          ) : (
            <Icon name="cup" size={28} />
          )}
        </div>
        <div className={STYLES.actions}>
          <FileTrigger
            acceptedFileTypes={ACCEPTED_IMAGE_TYPES}
            onSelect={(files) => {
              const file = files ? Array.from(files)[0] : undefined;
              if (file) onSelect(file);
            }}
          >
            <Button className={CONTROL_STYLES.button}>
              {previewUrl ? changeLabel : selectLabel}
            </Button>
          </FileTrigger>
          {hint && <span className={STYLES.hint}>{hint}</span>}
        </div>
      </div>
      {error && (
        <p role="alert" className={STYLES.error}>
          {error}
        </p>
      )}
    </div>
  );
}
