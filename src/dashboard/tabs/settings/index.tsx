import { useStrings } from "@/shared/i18n";
import { strings } from "./strings";

const STYLES = {
  title: "text-title font-bold text-balance text-navy",
  description: "mt-2 text-body text-balance text-navy/80",
} as const;

export function SettingsTab() {
  const s = useStrings(strings);

  return (
    <section>
      <h1 className={STYLES.title}>{s.title}</h1>
      <p className={STYLES.description}>{s.description}</p>
    </section>
  );
}
