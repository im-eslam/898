import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

interface LanguageToggleProps {
  onToggle: () => void;
  className?: string;
}

const STYLES = {
  button: "group flex h-12 shrink-0 items-center justify-center rounded-full",
  surface:
    "flex h-10 min-w-12 items-center justify-center rounded-full border border-sand bg-paper px-3.5 text-small font-bold text-charcoal transition-colors duration-fast ease-smooth group-data-hovered:border-taupe group-data-hovered:bg-white",
} as const;

export function HeaderLanguageToggle(props: LanguageToggleProps) {
  const { header } = useStrings(strings);

  const buttonClass = [STYLES.button, props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <Button
      aria-label={header.language.switch}
      onPress={props.onToggle}
      className={buttonClass}
    >
      <span lang={header.language.lang} className={STYLES.surface}>
        {header.language.label}
      </span>
    </Button>
  );
}
