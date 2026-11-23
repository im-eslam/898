import { useEffect, useRef, type ReactNode } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";

interface BaseSheetProps {
  title: string;
  description: string;
  isOpen: boolean;
  resetKey?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

const STYLES = {
  overlay: "fixed inset-0 z-50 bg-scrim",
  content:
    "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet border-t border-sand/50 bg-cream text-charcoal outline-none md:max-w-140",
  closeButton:
    "group absolute end-2 top-1 z-10 inline-flex size-10 items-center justify-center rounded-full outline-none transition-transform duration-interactive ease-smooth data-disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:active:scale-95 motion-reduce:transition-none",
  closeVisual:
    "flex size-8 items-center justify-center rounded-full bg-white text-brand ring-1 ring-black/5 transition-colors duration-interactive ease-smooth group-hover:bg-arctic motion-reduce:transition-none",
  handleRow:
    "relative z-0 flex h-11 w-full shrink-0 items-center justify-center",
  handle:
    "cursor-grab touch-none rounded-full !bg-charcoal/60 [@media(hover:hover)_and_(pointer:fine)]:hover:!bg-charcoal/70 active:cursor-grabbing",
  body: "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6 md:px-6",
  header: "mb-5 pe-12",
  title: "text-title font-bold text-balance text-charcoal",
  srOnly: "sr-only",
  footer:
    "shrink-0 border-t-[0.5px] border-sand/40 bg-cream px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6",
} as const;

export function BaseSheet(props: BaseSheetProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [props.resetKey]);

  return (
    <VaulDrawer.Root
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
      shouldScaleBackground={false}
      repositionInputs={false}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className={STYLES.overlay} />

        <VaulDrawer.Content className={STYLES.content}>
          <Button
            data-vaul-no-drag
            onPress={props.onClose}
            className={STYLES.closeButton}
          >
            <span className={STYLES.closeVisual}>
              <Icon name="close" size={20} />
            </span>
          </Button>

          <div className={STYLES.handleRow}>
            <VaulDrawer.Handle className={STYLES.handle} />
          </div>

          <div ref={bodyRef} data-vaul-no-drag className={STYLES.body}>
            <div className={STYLES.header}>
              <VaulDrawer.Title className={STYLES.title}>
                {props.title}
              </VaulDrawer.Title>
              <VaulDrawer.Description className={STYLES.srOnly}>
                {props.description}
              </VaulDrawer.Description>
            </div>

            {props.children}
          </div>

          {props.footer !== undefined && (
            <div className={STYLES.footer}>{props.footer}</div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
