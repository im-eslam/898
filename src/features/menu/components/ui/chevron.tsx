import { Icon } from "@/shared/icons";

type ChevronSize = "s" | "m" | "l";

interface ChevronProps {
  size?: ChevronSize;
  className?: string;
}

const STYLES = {
  root: "flex shrink-0 items-center justify-center rounded-full bg-mist text-brand",
  sizes: {
    s: { root: "size-6", icon: "size-3" },
    m: { root: "size-7", icon: "size-4" },
    l: { root: "size-8", icon: "size-4" },
  } satisfies Record<ChevronSize, { root: string; icon: string }>,
} as const;

export function Chevron(props: ChevronProps) {
  const look = STYLES.sizes[props.size ?? "l"];
  const rootClass = [STYLES.root, look.root, props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <span aria-hidden="true" className={rootClass}>
      <Icon name="arrow" className={look.icon} />
    </span>
  );
}
