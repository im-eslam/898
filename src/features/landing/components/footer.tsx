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

export function Footer() {
  const s = useStrings(strings);

  return (
    <footer className={STYLES.footer}>
      <p className={STYLES.lead}>
        {s.footer.lead}{" "}
        <span className={STYLES.emphasis}>{s.footer.emphasis}</span>
      </p>
      <p dir="ltr" className={STYLES.copyright}>
        {formatCopyright(s.footer.copyright)}
      </p>
    </footer>
  );
}
