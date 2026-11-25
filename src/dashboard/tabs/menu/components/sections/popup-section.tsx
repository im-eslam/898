import { useState } from "react";
import {
  Button,
  FileTrigger,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import toast from "react-hot-toast";
import type { AdminPopup, AdminPopupInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { replacePopupImage, updatePopup } from "../../api/menu";
import { CONTROL_STYLES } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { getErrorMessage } from "../../lib/get-error-message";
import { popupImageUrl } from "../../lib/image-url";
import { strings } from "../../strings";
import { ACCEPTED_IMAGE_TYPES } from "../fields/image-field";
import { ToggleField } from "../fields/toggle-field";

interface PopupSectionProps {
  popup: AdminPopup;
}

const STYLES = {
  section: "flex max-w-2xl flex-col gap-5",
  title: "text-heading font-bold text-navy",
  description: "text-small text-navy/70",
  delay: "flex max-w-xs flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  input:
    "w-full rounded-md border border-navy/15 bg-white px-3 py-2.5 text-body text-navy outline-none focus:border-brand",
  error: "text-small font-bold text-error",
  preview:
    "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-navy/15 bg-cream text-navy/30",
  image: "size-full object-cover",
  imageField: "flex flex-col gap-1.5",
  imageLabel: "text-small font-bold text-navy",
  imageRow: "flex items-center gap-4",
  imageActions: "flex min-w-0 flex-col items-start gap-1",
  hint: "text-caption text-navy/60",
  footer: "flex items-center justify-end gap-3 pt-2",
} as const;

export function PopupSection({ popup }: PopupSectionProps) {
  const s = useStrings(strings);
  const [draft, setDraft] = useState<AdminPopupInput>({
    enabled: popup.enabled,
    delaySeconds: popup.delaySeconds,
  });

  const saveMutation = useAdminMenuMutation((input: AdminPopupInput) =>
    updatePopup(input)
  );
  const imageMutation = useAdminMenuMutation((image: File) =>
    replacePopupImage(image)
  );

  const isDirty =
    draft.enabled !== popup.enabled ||
    draft.delaySeconds !== popup.delaySeconds;

  return (
    <section className={STYLES.section}>
      <header>
        <h2 className={STYLES.title}>{s.popup.title}</h2>
        <p className={STYLES.description}>{s.popup.description}</p>
      </header>

      <Form
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate(draft, {
            onSuccess: () => toast.success(s.common.saved),
          });
        }}
        className="flex flex-col gap-5"
      >
        <ToggleField
          label={s.popup.enabled}
          isSelected={draft.enabled}
          onChange={(enabled) =>
            setDraft((current) => ({ ...current, enabled }))
          }
        />

        <TextField
          value={String(draft.delaySeconds)}
          onChange={(value) => {
            const parsed = Number(value);
            setDraft((current) => ({
              ...current,
              delaySeconds: Number.isFinite(parsed)
                ? Math.min(Math.max(Math.round(parsed), 0), 30)
                : 0,
            }));
          }}
          className={STYLES.delay}
        >
          <Label className={STYLES.label}>{s.popup.delaySeconds}</Label>
          <Input
            type="number"
            min={0}
            max={30}
            step={1}
            inputMode="numeric"
            dir="ltr"
            className={STYLES.input}
          />
        </TextField>
        <p className="-mt-4 text-caption text-navy/60">{s.popup.delayHint}</p>

        <div className={STYLES.imageField}>
          <span className={STYLES.imageLabel}>{s.popup.image}</span>
          <div className={STYLES.imageRow}>
            <div className={STYLES.preview}>
              {popup.image ? (
                <img
                  src={popupImageUrl(popup.image)}
                  alt=""
                  className={STYLES.image}
                />
              ) : (
                <Icon name="cup" size={28} />
              )}
            </div>
            <div className={STYLES.imageActions}>
              <FileTrigger
                acceptedFileTypes={ACCEPTED_IMAGE_TYPES}
                onSelect={(files) => {
                  const file = files ? Array.from(files)[0] : undefined;
                  if (!file) return;
                  imageMutation.mutate(file);
                }}
              >
                <Button
                  isDisabled={imageMutation.isPending}
                  className={CONTROL_STYLES.button}
                >
                  {imageMutation.isPending
                    ? s.common.saving
                    : popup.image
                      ? s.products.image.change
                      : s.products.image.select}
                </Button>
              </FileTrigger>
              <span className={STYLES.hint}>{s.popup.imageHint}</span>
            </div>
          </div>
          {imageMutation.error && (
            <p role="alert" className={STYLES.error}>
              {getErrorMessage(s.errors, imageMutation.error)}
            </p>
          )}
        </div>

        {saveMutation.error && (
          <p role="alert" className={STYLES.error}>
            {getErrorMessage(s.errors, saveMutation.error)}
          </p>
        )}

        <div className={STYLES.footer}>
          <Button
            type="submit"
            isDisabled={
              !isDirty || saveMutation.isPending || imageMutation.isPending
            }
            className={CONTROL_STYLES.buttonPrimary}
          >
            {saveMutation.isPending ? s.common.saving : s.popup.save}
          </Button>
        </div>
      </Form>
    </section>
  );
}
