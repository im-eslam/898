import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import type { MenuDto } from "@api/contracts";
import { strings } from "../../strings";
import { menuImageUrl } from "../../util/image";
import { CloseButton } from "../ui/close-button";

interface PromoPopupProps {
  popup: MenuDto["popup"];
  busy: boolean;
}

const STYLES = {
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 data-entering:animate-fade-in data-exiting:animate-fade-out motion-reduce:animate-none",
  modal:
    "relative outline-none data-entering:animate-reveal-in data-exiting:animate-reveal-out motion-reduce:animate-none",
  dialog: "outline-none",
  image:
    "block h-auto max-h-[80dvh] w-auto max-w-[min(28rem,calc(100vw-2rem))] rounded-lg bg-white object-contain",
  close: "absolute end-1 top-1 z-10",
} as const;

export function PromoPopup(props: PromoPopupProps) {
  const { promo } = useStrings(strings);

  const imageUrl =
    props.popup.enabled && props.popup.image
      ? menuImageUrl("popup", props.popup.image)
      : null;

  const delayMs =
    Math.max(
      0,
      Number.isFinite(props.popup.delaySeconds) ? props.popup.delaySeconds : 0
    ) * 1000;

  const configKey = `${imageUrl}|${delayMs}`;
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    let cancelled = false;
    let timer = 0;
    const loader = new Image();

    const loaded = new Promise<void>((resolve, reject) => {
      loader.onload = () => resolve();
      loader.onerror = () => reject(new Error("Promo image failed to load"));
      loader.src = imageUrl;
    });

    const delay = new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, delayMs);
    });

    Promise.all([loaded, delay])
      .then(() => {
        if (!cancelled) setReadyKey(configKey);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      loader.onload = null;
      loader.onerror = null;
    };
  }, [imageUrl, delayMs, configKey]);

  if (!imageUrl) return null;

  const isOpen =
    readyKey === configKey && dismissedKey !== configKey && !props.busy;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) setDismissedKey(configKey);
      }}
      isDismissable
      className={STYLES.overlay}
    >
      <Modal className={STYLES.modal}>
        <Dialog aria-label={promo.label} className={STYLES.dialog}>
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            decoding="async"
            className={STYLES.image}
          />
          <CloseButton
            onPress={() => setDismissedKey(configKey)}
            className={STYLES.close}
          />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
