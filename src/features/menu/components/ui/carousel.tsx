import { useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

interface CarouselProps {
  labelledBy: string;
  dots?: boolean;
  children: ReactNode;
  className?: string;
}

const STYLES = {
  root: "relative",
  viewport: "overflow-hidden",
  track: "flex touch-pan-y gap-3 [&>*]:min-w-0 [&>*]:shrink-0",
  dots: "mt-3 flex items-center justify-center gap-1.5",
  dot: "h-1.5 rounded-full transition-all duration-fast ease-smooth motion-reduce:transition-none",
  dotActive: "w-4 bg-brand",
  dotInactive: "w-1.5 bg-sand data-hovered:bg-taupe",
} as const;

export function Carousel(props: CarouselProps) {
  const { carousel } = useStrings(strings);
  const locale = useLocale();
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    direction: locale === "ar" ? "rtl" : "ltr",
  });
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setSelected(api.selectedScrollSnap());
    const onReInit = () => {
      setCount(api.scrollSnapList().length);
      setSelected(api.selectedScrollSnap());
    };

    onReInit();
    api.on("select", onSelect);
    api.on("reInit", onReInit);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api]);

  const rootClass = [STYLES.root, props.className].filter(Boolean).join(" ");

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={props.labelledBy}
      className={rootClass}
    >
      <div ref={viewportRef} className={STYLES.viewport}>
        <div className={STYLES.track}>{props.children}</div>
      </div>

      {props.dots && count > 1 && (
        <div className={STYLES.dots}>
          {Array.from({ length: count }, (_, index) => (
            <Button
              key={index}
              aria-label={carousel.slide(index + 1)}
              aria-current={index === selected ? "true" : undefined}
              onPress={() => api?.scrollTo(index)}
              className={`${STYLES.dot} ${
                index === selected ? STYLES.dotActive : STYLES.dotInactive
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
