import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

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

const FLING_PX_PER_MS = 0.6;
const DRAG_PX = 8;
const STALE_MS = 100;

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

export function Carousel(props: CarouselProps) {
  const { carousel } = useStrings(strings);
  const locale = useLocale();
  const tone = STYLES.tone[props.tone ?? "default"];

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({ left: 0, time: 0, speed: 0 });
  const pressRef = useRef({ x: 0, y: 0, fling: false, moved: false });

  const items = Children.toArray(props.children);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const now = performance.now();
    const s = scrollRef.current;
    const elapsed = now - s.time;
    if (elapsed > 0) {
      s.speed = Math.abs(viewport.scrollLeft - s.left) / elapsed;
    }
    s.left = viewport.scrollLeft;
    s.time = now;
  };

  const onPointerDownCapture = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = scrollRef.current;
    const moving = performance.now() - s.time < STALE_MS;
    pressRef.current = {
      x: e.clientX,
      y: e.clientY,
      fling: moving && s.speed > FLING_PX_PER_MS,
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pressRef.current;
    if (
      Math.abs(e.clientX - p.x) > DRAG_PX ||
      Math.abs(e.clientY - p.y) > DRAG_PX
    ) {
      p.moved = true;
    }
  };

  const allowPress = useCallback(() => {
    const p = pressRef.current;
    return !p.fling && !p.moved;
  }, []);

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
          const bestSlide = slides[best];
          if (
            bestSlide &&
            (ratios.get(slide) ?? 0) > (ratios.get(bestSlide) ?? 0)
          ) {
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
          onPointerMove={onPointerMove}
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
