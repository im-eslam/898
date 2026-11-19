interface SectionTitleStrings {
  title: string;
}

interface SectionTitleProps {
  strings: SectionTitleStrings;
}

const STYLES = {
  title: "px-1 text-small font-bold text-charcoal",
} as const;

export function SectionTitle(props: SectionTitleProps) {
  return <h2 className={STYLES.title}>{props.strings.title}</h2>;
}
