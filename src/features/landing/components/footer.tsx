import { useStrings } from "@/shared/i18n";
import { strings } from "../strings";

const STYLES = {
  footer: "flex flex-col items-center gap-2 text-center",
  lead: "text-small text-navy",
  emphasis: "font-bold text-brand",
  copyright: "text-caption whitespace-nowrap text-navy/80",
} as const;

function formatCopyright(template: string): string {
  return template.replaceAll("{year}", String(new Date().getFullYear()));
}

function mapStrings(s: typeof strings.en) {
  return {
    lead: s.footer.lead,
    emphasis: s.footer.emphasis,
    copyright: s.footer.copyright,
  };
}

export function Footer() {
  const { lead, emphasis, copyright } = mapStrings(useStrings(strings));

  return (
    <footer className={STYLES.footer}>
      <p className={STYLES.lead}>
        {lead} <span className={STYLES.emphasis}>{emphasis}</span>
      </p>
      <p dir="ltr" className={STYLES.copyright}>
        {formatCopyright(copyright)}
      </p>
    </footer>
  );
}
