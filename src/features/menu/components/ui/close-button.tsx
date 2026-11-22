import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";

interface CloseButtonProps {
  onPress: () => void;
  className?: string;
}

const STYLES = {
  root: "group flex size-12 items-center justify-center rounded-full outline-none",
  surface:
    "duration-fast flex size-8 items-center justify-center rounded-full bg-white/85 text-navy ring-1 ring-arctic transition-colors ease-smooth group-data-hovered:bg-white motion-reduce:transition-none",
  icon: "size-4",
} as const;

export function CloseButton(props: CloseButtonProps) {
  return (
    <Button
      onPress={props.onPress}
      className={`${STYLES.root} ${props.className ?? ""}`}
    >
      <span className={STYLES.surface}>
        <Icon name="close" className={STYLES.icon} />
      </span>
    </Button>
  );
}
