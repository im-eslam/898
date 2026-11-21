import { Icon, type IconName } from "@/shared/icons";
import { Link, type AppRoute } from "@/shared/router";

type ActionCardTone = "standard" | "featured" | "social";

interface ActionCardStrings {
  title: string;
  hint?: string;
}

interface ActionCardBaseProps {
  icon: IconName;
  strings: ActionCardStrings;
  tone?: ActionCardTone;
}
interface ActionCardInternalProps extends ActionCardBaseProps {
  to: AppRoute;
}
interface ActionCardExternalProps extends ActionCardBaseProps {
  href: string;
}

type ActionCardProps = ActionCardInternalProps | ActionCardExternalProps;

const STYLES = {
  card: {
    base: "group flex min-h-16 w-full items-center gap-4 rounded-lg border px-4 py-3 transition duration-fast ease-smooth [@media(hover:hover)_and_(pointer:fine)]:active:scale-95 motion-reduce:transition-none",
    tone: {
      standard:
        "border-paper/50 bg-paper/80 text-navy hover:border-brand hover:bg-paper",
      featured: "border-transparent bg-brand text-paper hover:border-arctic",
      social:
        "border-paper/50 bg-paper/80 text-navy hover:border-brand hover:bg-paper",
    } satisfies Record<ActionCardTone, string>,
  },
  bubble: {
    base: "duration-fast flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ease-smooth motion-reduce:transition-none",
    tone: {
      standard: "bg-arctic/60 text-brand group-hover:bg-arctic",
      featured: "bg-paper text-brand",
      social: "bg-brand text-paper",
    } satisfies Record<ActionCardTone, string>,
  },
  arrow: {
    base: "duration-fast size-5 shrink-0 transition-transform ease-smooth group-hover:translate-x-1 motion-reduce:transition-none rtl:group-hover:-translate-x-1",
    tone: {
      standard: "text-navy/40 group-hover:text-brand",
      featured: "text-paper/80 group-hover:text-paper",
      social: "text-navy/40 group-hover:text-brand",
    } satisfies Record<ActionCardTone, string>,
  },
  text: {
    stack: "flex min-w-0 flex-1 flex-col",
    title: "text-heading font-bold",
    hint: "text-small opacity-80",
  },
} as const;

export function ActionCard(props: ActionCardProps) {
  const tone = props.tone ?? "standard";
  const className = `${STYLES.card.base} ${STYLES.card.tone[tone]}`;

  const content = (
    <>
      <span className={`${STYLES.bubble.base} ${STYLES.bubble.tone[tone]}`}>
        <Icon name={props.icon} />
      </span>
      <span className={STYLES.text.stack}>
        <span className={STYLES.text.title}>{props.strings.title}</span>
        {props.strings.hint && (
          <span className={STYLES.text.hint}>{props.strings.hint}</span>
        )}
      </span>
      <Icon
        name="arrow"
        className={`${STYLES.arrow.base} ${STYLES.arrow.tone[tone]}`}
      />
    </>
  );

  if ("to" in props) {
    return (
      <Link href={props.to} className={className}>
        {content}
      </Link>
    );
  } else {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }
}
