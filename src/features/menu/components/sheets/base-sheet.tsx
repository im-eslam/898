import { useEffect, useRef, useState, type ReactNode } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";

const TOP_BAR_PX = 48;

export type SheetVariant = "handle" | "topBar";

const SHEET = {
  overlay: "fixed inset-0 z-50 bg-scrim",
  panel:
    "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-sheet border-t border-sand/50 bg-cream text-charcoal outline-none md:max-w-140",
  footer:
    "shrink-0 border-t-[0.5px] border-sand/40 bg-cream px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-6",
} as const;

const STYLES = {
  closeButton:
    "group absolute end-2 top-1 z-30 inline-flex size-10 items-center justify-center rounded-full outline-none transition-transform duration-interactive ease-smooth data-disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:active:scale-95 motion-reduce:transition-none",
  closeVisual:
    "flex size-8 items-center justify-center rounded-full bg-white text-brand ring-1 ring-black/5 transition-colors duration-interactive ease-smooth group-hover:bg-arctic motion-reduce:transition-none",
  handleRow:
    "relative z-0 flex h-11 w-full shrink-0 items-center justify-center",
  handle:
    "cursor-grab touch-none rounded-full !bg-charcoal/60 [@media(hover:hover)_and_(pointer:fine)]:hover:!bg-charcoal/70 active:cursor-grabbing",
  handleScroll:
    "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-none px-4 pb-6 md:px-6",
  handleHeader: "mb-5 pe-12",
  title: "text-title font-bold text-balance text-charcoal",
  topTitle: "pe-12 text-title font-bold text-balance text-charcoal",
  srOnly: "sr-only",
  bar: [
    "absolute inset-x-0 top-0 z-20 flex h-12 items-center border-b border-sand/40",
    "bg-cream ps-4 pe-14",
    "transition-[opacity,transform] duration-slow ease-smooth motion-reduce:transition-none",
  ].join(" "),
  barHidden: "pointer-events-none translate-y-1 opacity-0",
  barShown: "pointer-events-auto translate-y-0 opacity-100",
  barTitle: "min-w-0 truncate text-body font-bold text-charcoal",
  topScroll: "min-h-0 flex-1 overflow-y-auto overscroll-none",
  topBody: "flex flex-col gap-6 px-4 pt-5 pb-6 md:px-6",
} as const;

interface CloseProps {
  onPress: () => void;
}

function CloseButton(props: CloseProps) {
  return (
    <Button
      data-vaul-no-drag
      onPress={props.onPress}
      className={STYLES.closeButton}
    >
      <span className={STYLES.closeVisual}>
        <Icon name="close" size={20} />
      </span>
    </Button>
  );
}

interface SheetBodyProps {
  variant: SheetVariant;
  title: string;
  description: string;
  resetKey: string;
  onClose: () => void;
  children: ReactNode;
}

function SheetBody(props: SheetBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [pastTitle, setPastTitle] = useState(false);

  useEffect(() => {
    const root = scrollRef.current;
    const target = titleRef.current;
    if (
      props.variant !== "topBar" ||
      !root ||
      !target ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const barBottom = entry.rootBounds?.top ?? 0;
        setPastTitle(entry.boundingClientRect.bottom <= barBottom);
      },
      { root, rootMargin: `-${TOP_BAR_PX}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [props.variant]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [props.resetKey]);

  if (props.variant === "handle") {
    return (
      <>
        <CloseButton onPress={props.onClose} />

        <div className={STYLES.handleRow}>
          <VaulDrawer.Handle className={STYLES.handle} />
        </div>

        <div ref={scrollRef} data-vaul-no-drag className={STYLES.handleScroll}>
          <div className={STYLES.handleHeader}>
            <VaulDrawer.Title className={STYLES.title}>
              {props.title}
            </VaulDrawer.Title>
            <VaulDrawer.Description className={STYLES.srOnly}>
              {props.description}
            </VaulDrawer.Description>
          </div>
          {props.children}
        </div>
      </>
    );
  }

  const barClass = [
    STYLES.bar,
    pastTitle ? STYLES.barShown : STYLES.barHidden,
  ].join(" ");

  return (
    <>
      <div aria-hidden="true" className={barClass}>
        <span className={STYLES.barTitle}>{props.title}</span>
      </div>

      <CloseButton onPress={props.onClose} />

      <div ref={scrollRef} data-vaul-no-drag className={STYLES.topScroll}>
        <div className={STYLES.topBody}>
          <div ref={titleRef}>
            <VaulDrawer.Title className={STYLES.topTitle}>
              {props.title}
            </VaulDrawer.Title>
            <VaulDrawer.Description className={STYLES.srOnly}>
              {props.description}
            </VaulDrawer.Description>
          </div>
          {props.children}
        </div>
      </div>
    </>
  );
}

interface BaseSheetProps {
  variant: SheetVariant;
  title: string;
  description: string;
  isOpen: boolean;
  resetKey?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function BaseSheet(props: BaseSheetProps) {
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
        <VaulDrawer.Overlay className={SHEET.overlay} />

        <VaulDrawer.Content className={SHEET.panel}>
          <SheetBody
            variant={props.variant}
            title={props.title}
            description={props.description}
            resetKey={props.resetKey ?? ""}
            onClose={props.onClose}
          >
            {props.children}
          </SheetBody>

          {props.footer !== undefined && (
            <div className={SHEET.footer}>{props.footer}</div>
          )}
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
