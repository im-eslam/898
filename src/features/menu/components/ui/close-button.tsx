import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../../strings";

interface CloseButtonProps {
  onPress: () => void;
  className?: string;
}

const STYLES = {
  root: "group flex size-12 items-center justify-center rounded-full outline-none",
  surface:
    "duration-fast flex size-8 items-center justify-center rounded-full bg-white/85 text-navy ring-1 ring-arctic transition-colors ease-smooth group-data-hovered:bg-white",
  icon: "size-4",
} as const;

export function CloseButton(props: CloseButtonProps) {
  const { common } = useStrings(strings);

  return (
    <Button
      aria-label={common.close}
      onPress={props.onPress}
      className={[STYLES.root, props.className].filter(Boolean).join(" ")}
    >
      <span className={STYLES.surface}>
        <Icon name="close" className={STYLES.icon} />
      </span>
    </Button>
  );
}
