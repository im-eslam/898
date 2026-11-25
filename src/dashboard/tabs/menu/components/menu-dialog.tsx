import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";

export interface MenuDialogProps {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  isDismissable?: boolean;
  size?: "sm" | "md" | "lg";
  onClose: () => void;
  children: ReactNode;
}

const STYLES = {
  overlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 entering:animate-fade-in exiting:animate-fade-out",
  modal:
    "flex max-h-[min(88dvh,42rem)] w-full flex-col overflow-hidden rounded-2xl border border-navy/10 bg-cream text-navy shadow-card-raised outline-none entering:animate-pop-in exiting:animate-pop-out",
  size: { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" },
  header:
    "flex shrink-0 items-start justify-between gap-4 border-b border-navy/10 px-6 py-5",
  title: "min-w-0 text-heading font-bold text-balance text-navy",
  body: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5",
} as const;

export function MenuDialog({
  isOpen,
  title,
  closeLabel,
  isDismissable = true,
  size = "md",
  onClose,
  children,
}: MenuDialogProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
      onOpenChange={(open) => !open && onClose()}
      className={STYLES.overlay}
    >
      <Modal className={`${STYLES.modal} ${STYLES.size[size]}`}>
        <Dialog className="flex min-h-0 flex-1 flex-col outline-none">
          <header className={STYLES.header}>
            <Heading slot="title" className={STYLES.title}>
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
          <div className={STYLES.body}>{children}</div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
