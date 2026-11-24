import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { Icon } from "@/shared/icons";
import { ReviewDrawer } from "@/features/review/components/shell/review-drawer";
import { CONTROL_STYLES } from "../control-styles";
import { useIsDesktop } from "../hooks/use-is-desktop";

export interface ResponsiveDialogProps {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  isDismissable?: boolean;
  size?: "md" | "lg";
  onClose: () => void;
  children: ReactNode;
}

const STYLES = {
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4",
  modal:
    "flex max-h-[min(85dvh,40rem)] w-full flex-col overflow-hidden rounded-2xl border border-sand/50 bg-cream text-charcoal outline-none",
  modalSize: { md: "max-w-md", lg: "max-w-lg" },
  modalHeader:
    "flex shrink-0 items-start justify-between gap-4 border-b border-sand/60 px-6 py-5",
  modalTitle: "min-w-0 text-heading font-bold text-balance text-navy",
  modalBody: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5",
} as const;

function ModalDialog({
  isOpen,
  title,
  closeLabel,
  isDismissable = true,
  size = "lg",
  onClose,
  children,
}: ResponsiveDialogProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
      onOpenChange={(open) => !open && onClose()}
      className={STYLES.overlay}
    >
      <Modal className={`${STYLES.modal} ${STYLES.modalSize[size]}`}>
        <Dialog className="flex min-h-0 flex-1 flex-col outline-none">
          <header className={STYLES.modalHeader}>
            <Heading slot="title" className={STYLES.modalTitle}>
              {title}
            </Heading>
            <Button
              slot="close"
              aria-label={closeLabel}
              className={CONTROL_STYLES.iconButton}
            >
              <Icon name="close" size={18} />
            </Button>
          </header>
          <div className={STYLES.modalBody}>{children}</div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function DrawerDialog({
  isOpen,
  title,
  closeLabel,
  isDismissable = true,
  onClose,
  children,
}: ResponsiveDialogProps) {
  return (
    <ReviewDrawer
      strings={{ title, description: title }}
      closeLabel={closeLabel}
      isOpen={isOpen}
      isCloseDisabled={!isDismissable}
      onClose={onClose}
    >
      {children}
    </ReviewDrawer>
  );
}

/** Centered modal on desktop, bottom sheet on phones. */
export function ResponsiveDialog(props: ResponsiveDialogProps) {
  const isDesktop = useIsDesktop();
  return isDesktop ? <ModalDialog {...props} /> : <DrawerDialog {...props} />;
}
