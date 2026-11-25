import { useState, type ReactNode } from "react";
import { Button, Dialog, Form, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Drawer as VaulDrawer } from "vaul";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";
import { useIsDesktop } from "../hooks/use-is-desktop";
import { strings } from "../strings";
import { SheetContainerContext } from "./sheet-context";

export type DialogSize = "xs" | "sm" | "md" | "lg";

export interface MenuDialogProps {
  isOpen: boolean;
  title: string;
  isDismissable?: boolean;
  size?: DialogSize;
  // Fixed height (up to the screen) for dialogs whose content swaps, so the dialog never jumps.
  isTall?: boolean;
  // Change this when the body shows something different, so it starts scrolled to the top.
  contentKey?: string;
  error?: string;
  footer?: ReactNode;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
}

// Widths are set inline on purpose. A class can lose to global CSS in the host app, and then a
// dialog grows to the full screen width. An inline style cannot be overridden by a stylesheet.
// On phones every dialog is a bottom sheet, so these only apply from 640 px up.
const SIZE: Record<DialogSize, string> = {
  xs: "20rem",
  sm: "26rem",
  md: "30rem",
  lg: "44rem",
};

const MODAL_MAX_HEIGHT = "min(86dvh, 46rem)";
const SHEET_MAX_HEIGHT = "92dvh";

// Reduced motion users get the dialog without the animation.
const REDUCED = "motion-reduce:data-entering:animate-none motion-reduce:data-exiting:animate-none";

const STYLES = {
  sheetOverlay: "fixed inset-0 z-50 bg-scrim",
  // No overflow clipping here, so dropdowns can open inside the sheet. The body scrolls instead.
  sheet:
    "fixed inset-x-0 bottom-0 z-50 flex w-full flex-col rounded-t-2xl border-t border-navy/10 bg-cream text-navy outline-none",
  handleRow: "flex h-6 shrink-0 items-center justify-center",
  handle: "h-1.5 w-12 cursor-grab rounded-full bg-navy/20 active:cursor-grabbing",

  modalOverlay: `fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 data-entering:animate-fade-in data-exiting:animate-fade-out ${REDUCED}`,
  modal: `flex w-full flex-col overflow-hidden rounded-2xl border border-navy/10 bg-cream text-navy outline-none data-entering:animate-pop-in data-exiting:animate-pop-out ${REDUCED}`,

  // @container: fields, footers and grids respond to the width of this dialog, not the screen.
  // That keeps the product form readable whether it sits on a phone, tablet or wide desktop.
  form: "@container flex min-h-0 flex-1 flex-col",
  dialog: "flex min-h-0 flex-1 flex-col outline-none",
  header: "flex shrink-0 items-center justify-between gap-4 border-b border-navy/10 px-5 py-4 sm:px-6 sm:py-5",
  title: "min-w-0 text-heading font-bold text-balance text-navy",
  body: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6",
  footer:
    "flex shrink-0 flex-col gap-3 border-t border-navy/10 bg-cream px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4",
  error: "rounded-md border border-error/30 bg-error/10 px-4 py-3 text-small font-bold text-error",
  srOnly: "sr-only",
} as const;

interface PanelProps {
  contentKey?: string;
  titleNode: ReactNode;
  handle?: ReactNode;
  error?: string;
  footer?: ReactNode;
  isDismissable: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
}

// Shared by the desktop dialog and the phone sheet. Fields and footer share one form,
// so Enter submits and the footer stays pinned.
function Panel({ contentKey, titleNode, handle, error, footer, isDismissable, onClose, onSubmit, children }: PanelProps) {
  const closeLabel = useStrings(strings).dialog.close;
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={STYLES.form}
    >
      {handle}
      <header className={STYLES.header}>
        {titleNode}
        {/* Disabled while a save runs, so closing can never discard a request in flight. */}
        <Button
          aria-label={closeLabel}
          isDisabled={!isDismissable}
          onPress={onClose}
          className={CONTROL_STYLES.iconButton}
        >
          <Icon name="close" size={18} />
        </Button>
      </header>
      {/* data-vaul-no-drag: scrolling or selecting text in the form must never drag the sheet shut. */}
      <div key={contentKey} className={STYLES.body} data-vaul-no-drag>
        {children}
      </div>
      {(footer || error) && (
        <footer className={STYLES.footer}>
          {error && (
            <p role="alert" className={STYLES.error}>
              {error}
            </p>
          )}
          {footer}
        </footer>
      )}
    </Form>
  );
}

export function MenuDialog({
  isOpen,
  title,
  isDismissable = true,
  size = "md",
  isTall = false,
  contentKey,
  error,
  footer,
  onClose,
  onSubmit,
  children,
}: MenuDialogProps) {
  const isDesktop = useIsDesktop();
  const [sheetElement, setSheetElement] = useState<HTMLDivElement | null>(null);

  if (isDesktop) {
    return (
      <ModalOverlay
        isOpen={isOpen}
        isDismissable={isDismissable}
        isKeyboardDismissDisabled={!isDismissable}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        className={STYLES.modalOverlay}
      >
        <Modal
          className={STYLES.modal}
          style={{
            maxWidth: SIZE[size],
            maxHeight: MODAL_MAX_HEIGHT,
            height: isTall ? MODAL_MAX_HEIGHT : undefined,
          }}
        >
          <Dialog className={STYLES.dialog}>
            <Panel
              contentKey={contentKey}
              titleNode={
                <Heading slot="title" className={STYLES.title}>
                  {title}
                </Heading>
              }
              error={error}
              footer={footer}
              isDismissable={isDismissable}
              onClose={onClose}
              onSubmit={onSubmit}
            >
              {children}
            </Panel>
          </Dialog>
        </Modal>
      </ModalOverlay>
    );
  }

  return (
    <VaulDrawer.Root
      open={isOpen}
      dismissible={isDismissable}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className={STYLES.sheetOverlay} />
        <VaulDrawer.Content
          ref={setSheetElement}
          className={STYLES.sheet}
          style={{ maxHeight: SHEET_MAX_HEIGHT, height: isTall ? SHEET_MAX_HEIGHT : undefined }}
        >
          <VaulDrawer.Description className={STYLES.srOnly}>{title}</VaulDrawer.Description>
          <SheetContainerContext.Provider value={sheetElement}>
            <Panel
              contentKey={contentKey}
              titleNode={<VaulDrawer.Title className={STYLES.title}>{title}</VaulDrawer.Title>}
              handle={
                <div className={STYLES.handleRow}>
                  <VaulDrawer.Handle className={STYLES.handle} />
                </div>
              }
              error={error}
              footer={footer}
              isDismissable={isDismissable}
              onClose={onClose}
              onSubmit={onSubmit}
            >
              {children}
            </Panel>
          </SheetContainerContext.Provider>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
