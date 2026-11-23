import { useStrings } from "@/shared/i18n";
import { strings } from "../strings";

interface LanguageToggleProps {
  onPress: () => void;
}

const STYLES = {
  button: "group inline-flex min-h-12 min-w-12 items-center justify-center",
  label:
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full bg-paper/85 px-4 text-small font-bold whitespace-nowrap text-navy transition duration-fast ease-smooth group-active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-paper [@media(hover:hover)_and_(pointer:fine)]:group-active:scale-[0.97]",
} as const;

export function LanguageToggle(props: LanguageToggleProps) {
  const { language } = useStrings(strings);

  return (
    <button
      type="button"
      onClick={props.onPress}
      aria-label={language.switchTo}
      className={STYLES.button}
    >
      <span className={STYLES.label}>{language.name}</span>
    </button>
  );
}
