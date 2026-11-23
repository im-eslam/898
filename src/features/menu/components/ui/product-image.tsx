import { useState } from "react";
import { Icon } from "@/shared/icons";
import { menuImageUrl } from "../../util/image";

interface ProductImageProps {
  image: string | null | undefined;
  kind: "thumb" | "full";
  alt?: string;
  priority?: boolean;
  grayscale?: boolean;
  className?: string;
}

const STYLES = {
  frame: "relative overflow-hidden bg-arctic/40",
  grayscale: "grayscale",
  photo:
    "absolute inset-0 size-full object-cover transition-opacity duration-base ease-smooth",
  shown: "opacity-100",
  hidden: "opacity-0",
  placeholder: "absolute inset-0 flex items-center justify-center text-navy/20",
  placeholderIcon: "size-10",
} as const;

export function ProductImage(props: ProductImageProps) {
  const src = props.image ? menuImageUrl(props.kind, props.image) : null;
  const [state, setState] = useState<"loading" | "loaded" | "broken">(
    "loading"
  );
  const [shownSrc, setShownSrc] = useState(src);

  if (shownSrc !== src) {
    setShownSrc(src);
    setState("loading");
  }

  const frameClass = [
    STYLES.frame,
    props.grayscale && STYLES.grayscale,
    props.className,
  ]
    .filter(Boolean)
    .join(" ");
  const photoClass = `${STYLES.photo} ${
    state === "loaded" ? STYLES.shown : STYLES.hidden
  }`;

  return (
    <div className={frameClass}>
      {src && state !== "broken" ? (
        <img
          src={src}
          alt={props.alt ?? ""}
          loading={props.priority ? "eager" : "lazy"}
          fetchPriority={props.priority ? "high" : undefined}
          decoding="async"
          draggable={false}
          onLoad={() => setState("loaded")}
          onError={() => setState("broken")}
          className={photoClass}
        />
      ) : (
        <span aria-hidden="true" className={STYLES.placeholder}>
          <Icon name="cup" className={STYLES.placeholderIcon} />
        </span>
      )}
    </div>
  );
}
