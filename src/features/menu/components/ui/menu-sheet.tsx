import type { ReactNode } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { CloseButton } from "./close-button";

interface MenuSheetStrings {
  title: string;
  description: string;
}

interface MenuSheetProps {
  strings: MenuSheetStrings;
  isOpen: boolean;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const STYLES = {
  overlay: "fixed inset-0 z-50 bg-scrim",
  content:
    "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-120 flex-col overflow-clip rounded-t-sheet border-t border-sand/50 bg-cream text-charcoal outline-none md:max-w-140",
  close: "absolute end-2 top-1 z-10",
  handleRow:
    "relative z-0 flex h-11 w-full shrink-0 items-center justify-center",
  handle:
    "cursor-grab touch-none rounded-full !bg-charcoal/60 active:cursor-grabbing",
  body: "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6 md:px-6",
  header: "mb-5 pe-12",
  title: "text-title font-bold text-balance text-charcoal",
  description: "sr-only",
  footer:
    "shrink-0 border-t-[0.5px] border-sand/40 bg-cream px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6",
} as const;

export function MenuSheet(props: MenuSheetProps) {
  return (
    <VaulDrawer.Root
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
      shouldScaleBackground={false}
      handleOnly
      repositionInputs={false}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className={STYLES.overlay} />

        <VaulDrawer.Content className={STYLES.content}>
          <CloseButton onPress={props.onClose} className={STYLES.close} />

          <div className={STYLES.handleRow}>
            <VaulDrawer.Handle className={STYLES.handle} />
          </div>

          <div className={STYLES.body}>
            <div className={STYLES.header}>
              <VaulDrawer.Title className={STYLES.title}>
                {props.strings.title}
              </VaulDrawer.Title>
              <VaulDrawer.Description className={STYLES.description}>
                {props.strings.description}
              </VaulDrawer.Description>
            </div>
            {props.children}
          </div>

          {props.footer && <div className={STYLES.footer}>{props.footer}</div>}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
