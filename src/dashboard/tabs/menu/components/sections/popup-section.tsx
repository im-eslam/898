import { useEffect, useState } from "react";
import { Button } from "react-aria-components";
import type { AdminPopup, AdminPopupInput } from "@api/contracts";
import { useStrings } from "@/shared/i18n";
import { replacePopupImage, updatePopup } from "../../api/menu";
import { CONTROL_STYLES } from "../../control-styles";
import { useAdminMenuMutation } from "../../hooks/use-admin-menu";
import { useObjectUrl } from "../../hooks/use-object-url";
import { errorText } from "../../lib/get-error-message";
import { popupImageUrl } from "../../lib/image-url";
import { strings } from "../../strings";
import { ImageField } from "../fields/image-field";
import { NumberInputField } from "../fields/number-field";
import { ToggleField } from "../fields/toggle-field";

interface PopupSectionProps {
  popup: AdminPopup;
}

const STYLES = {
  grid: "grid gap-4 md:grid-cols-2",
  card: "flex min-w-0 flex-col gap-5 rounded-lg border border-navy/10 bg-white p-4 sm:p-5",
  error: "text-small font-bold text-error",
  footer: "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between",
  status: "text-small font-bold text-navy/70",
} as const;

// Picking an image only previews it. Save sends the image and the settings together.
export function PopupSection({ popup }: PopupSectionProps) {
  const s = useStrings(strings);
  const [draft, setDraft] = useState<AdminPopupInput>({ enabled: popup.enabled, delaySeconds: popup.delaySeconds });
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const pendingUrl = useObjectUrl(pendingImage);

  // When the saved popup changes (after a save, or from another admin), take its values.
  // The key covers every saved field, so unsaved edits are only replaced by real changes.
  useEffect(() => {
    setDraft({ enabled: popup.enabled, delaySeconds: popup.delaySeconds });
  }, [popup.enabled, popup.delaySeconds, popup.image]);

  const saveMutation = useAdminMenuMutation(
    async ({ image, settings }: { image: File | null; settings: AdminPopupInput }) => {
      if (image) await replacePopupImage(image);
      return updatePopup(settings);
    }
  );

  const hasImage = pendingImage !== null || popup.image !== null;
  const isDirty =
    draft.enabled !== popup.enabled || draft.delaySeconds !== popup.delaySeconds || pendingImage !== null;
  const needsImage = draft.enabled && !hasImage;
  const canSave = isDirty && !needsImage && !saveMutation.isPending;
  const previewUrl = pendingUrl ?? (popup.image ? popupImageUrl(popup.image) : null);
  const saveError = errorText(s.errors, saveMutation.error);

  const save = () => {
    if (!canSave) return;
    saveMutation.mutate({ image: pendingImage, settings: draft }, { onSuccess: () => setPendingImage(null) });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className={STYLES.grid}>
        <div className={STYLES.card}>
          <ImageField
            variant="poster"
            label={s.popup.image}
            previewUrl={previewUrl}
            isPending={pendingImage !== null}
            pendingLabel={s.popup.imagePending}
            onSelect={setPendingImage}
            selectLabel={s.products.image.select}
            changeLabel={s.products.image.change}
          />
        </div>

        <div className={STYLES.card}>
          <ToggleField
            label={s.popup.enabled}
            isSelected={draft.enabled}
            onChange={(enabled) => setDraft((current) => ({ ...current, enabled }))}
          />
          <NumberInputField
            label={s.popup.delaySeconds}
            value={draft.delaySeconds}
            min={0}
            max={30}
            onChange={(delaySeconds) => setDraft((current) => ({ ...current, delaySeconds }))}
          />
          {needsImage && <p role="alert" className={STYLES.error}>{s.errors.MENU_POPUP_IMAGE_REQUIRED}</p>}
        </div>
      </div>

      {saveError && (
        <p role="alert" className={STYLES.error}>
          {saveError}
        </p>
      )}

      <div className={STYLES.footer}>
        <span className={STYLES.status}>{isDirty ? s.common.unsavedChanges : ""}</span>
        <Button onPress={save} isDisabled={!canSave} className={`${CONTROL_STYLES.buttonPrimary} w-full sm:w-auto`}>
          {saveMutation.isPending ? s.common.saving : s.popup.save}
        </Button>
      </div>
    </section>
  );
}
