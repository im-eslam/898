import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

interface BaseSectionHeadingProps {
  id: string;
  light?: boolean;
  className?: string;
}

interface BuiltInSectionHeadingProps extends BaseSectionHeadingProps {
  section: "signatures" | "pairings";
}

interface CustomSectionHeadingProps extends BaseSectionHeadingProps {
  title: string;
  sub?: string;
}

type SectionHeadingProps =
  BuiltInSectionHeadingProps | CustomSectionHeadingProps;

const STYLES = {
  root: "flex flex-col gap-1",
  title: "text-title font-bold tracking-tight text-balance",
  titleDark: "text-charcoal",
  titleLight: "text-cream",
  sub: "text-small font-medium",
  subDark: "text-navy/80",
  subLight: "text-cream/75",
} as const;

export function SectionHeading(props: SectionHeadingProps) {
  const { sections } = useStrings(strings);

  const content = "section" in props ? sections[props.section] : props;
  const light = props.light === true;

  const rootClass = [STYLES.root, props.className].filter(Boolean).join(" ");
  const titleClass = `${STYLES.title} ${light ? STYLES.titleLight : STYLES.titleDark}`;
  const subClass = `${STYLES.sub} ${light ? STYLES.subLight : STYLES.subDark}`;

  return (
    <div className={rootClass}>
      <h2 id={props.id} className={titleClass}>
        {content.title}
      </h2>
      {content.sub && <p className={subClass}>{content.sub}</p>}
    </div>
  );
}
