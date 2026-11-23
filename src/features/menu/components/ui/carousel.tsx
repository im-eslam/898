import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

// Cards inside a carousel ask this before opening.
// It returns false when the touch stopped a swipe or the track moved during it.
const TapGuardContext = createContext<() => boolean>(() => true);

export function useTapGuard() {
  return useContext(TapGuardContext);
}

interface CarouselProps {
  labelledBy: string;
  itemClassName: string;
  tone?: "default" | "light";
  className?: string;
  children: ReactNode;
}

const STYLES = {
  viewport:
    "snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-2 -my-2 px-1 -mx-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  track: "flex gap-3",
  item: "shrink-0 snap-start",
  dots: "mt-2 flex items-center justify-center",
  dot: "flex size-11 items-center justify-center rounded-full outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-current",
  bar: "h-1.5 rounded-full transition-[width,background-color] duration-fast ease-smooth motion-reduce:transition-none",
  tone: {
    default: { dot: "text-brand", on: "w-5 bg-brand", off: "w-1.5 bg-sand" },
    light: { dot: "text-paper", on: "w-5 bg-paper", off: "w-1.5 bg-paper/35" },
  },
} as const;

const IDLE_MS = 180;

export function Carousel(props: CarouselProps) {
  const { carousel } = useStrings(strings);
  const locale = useLocale();
  const tone = STYLES.tone[props.tone ?? "default"];

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const movingRef = useRef(false);
  const idleRef = useRef<number | undefined>(undefined);
  const pressRef = useRef({ moving: false, left: 0 });

  const items = Children.toArray(props.children);
  const [active, setActive] = useState(0);

  // True while the track is scrolling, false shortly after it settles.
  const onScroll = () => {
    movingRef.current = true;
    window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => {
      movingRef.current = false;
    }, IDLE_MS);
  };

  useEffect(() => () => window.clearTimeout(idleRef.current), []);

  // Record the state at touch start. This runs before any card's press handler.
  const onPointerDownCapture = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    pressRef.current = {
      moving: movingRef.current,
      left: viewport.scrollLeft,
    };
  };

  // Called on release. Opens only if the track was still for the whole touch.
  const allowPress = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return true;
    const press = pressRef.current;
    return (
      !press.moving &&
      !movingRef.current &&
      Math.abs(viewport.scrollLeft - press.left) < 2
    );
  }, []);

  // IntersectionObserver fires on threshold crossings, not on every scroll frame.
  useEffect(() => {
    const viewport = viewportRef.current;
    const slides = Array.from(trackRef.current?.children ?? []);
    if (!viewport || slides.length < 2) return;

    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }
        let best = 0;
        slides.forEach((slide, i) => {
          if ((ratios.get(slide) ?? 0) > (ratios.get(slides[best]!) ?? 0)) {
            best = i;
          }
        });
        setActive(best);
      },
      { root: viewport, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [items.length]);

  const goTo = (index: number) => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    trackRef.current?.children[index]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  return (
    <TapGuardContext.Provider value={allowPress}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={props.labelledBy}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={props.className}
      >
        <div
          ref={viewportRef}
          className={STYLES.viewport}
          onScroll={onScroll}
          onPointerDownCapture={onPointerDownCapture}
        >
          <div ref={trackRef} className={STYLES.track}>
            {items.map((child, i) => (
              <div key={i} className={`${STYLES.item} ${props.itemClassName}`}>
                {child}
              </div>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <div className={STYLES.dots}>
            {items.map((_, i) => (
              <Button
                key={i}
                aria-label={carousel.slide(i + 1)}
                aria-current={i === active ? "true" : undefined}
                onPress={() => goTo(i)}
                className={`${STYLES.dot} ${tone.dot}`}
              >
                <span
                  aria-hidden="true"
                  className={`${STYLES.bar} ${i === active ? tone.on : tone.off}`}
                />
              </Button>
            ))}
          </div>
        )}
      </div>
    </TapGuardContext.Provider>
  );
}
