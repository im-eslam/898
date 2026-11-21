import { Button } from "react-aria-components";
import { Icon, type IconName } from "@/shared/icons";

interface ChoiceCardStrings {
  title: string;
  hint: string;
}

interface ChoiceCardProps {
  icon: IconName;
  strings: ChoiceCardStrings;
  onPress: () => void;
}

const STYLES = {
  card: "group flex min-h-16 w-full items-center gap-4 rounded-lg border border-white/50 bg-white/80 px-4 py-3 text-start outline-none transition duration-interactive ease-smooth data-focused:ring-2 data-focused:ring-brand data-hovered:border-brand data-hovered:bg-white [@media(hover:hover)_and_(pointer:fine)]:data-pressed:scale-[0.98] motion-reduce:transition-none",
  bubble:
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-arctic/60 text-brand transition-colors duration-interactive ease-smooth group-data-hovered:bg-arctic motion-reduce:transition-none",
  icon: "size-6",
  text: "min-w-0 flex-1",
  title: "text-heading block font-bold text-navy text-balance",
  hint: "text-small mt-0.5 block text-balance text-navy/65",
  arrow:
    "size-5 shrink-0 text-navy/40 transition duration-interactive ease-smooth group-data-hovered:translate-x-1 group-data-hovered:text-brand rtl:group-data-hovered:-translate-x-1 motion-reduce:transition-none",
} as const;

export function ChoiceCard(props: ChoiceCardProps) {
  return (
    <Button onPress={props.onPress} className={STYLES.card}>
      <span className={STYLES.bubble}>
        <Icon name={props.icon} className={STYLES.icon} />
      </span>
      <span className={STYLES.text}>
        <span className={STYLES.title}>{props.strings.title}</span>
        <span className={STYLES.hint}>{props.strings.hint}</span>
      </span>
      <Icon name="arrow" className={STYLES.arrow} />
    </Button>
  );
}
