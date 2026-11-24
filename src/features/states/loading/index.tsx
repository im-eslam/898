import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { Background } from "../components/background";
import { strings } from "./strings";

type LoadingPageProps = {
  kind?: "spinner" | "menu";
};

const LIQUID_FILL_CSS = `
  @keyframes liquid-fill {
    0%, 15% { clip-path: inset(100% 0 0 0); }
    45%, 55% { clip-path: inset(0 0 0 0); }
    85%, 100% { clip-path: inset(100% 0 0 0); }
  }
  .animate-liquid-fill {
    animation: liquid-fill 2.5s var(--ease-smooth, ease-in-out) infinite;
  }
`;

const styles = {
  spinner: {
    root: "fixed inset-0 isolate flex items-center justify-center",
    ring: "size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand",
    label: "sr-only",
  },
  menu: {
    section:
      "relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12 text-center",
    content: "relative z-10 flex w-full max-w-md flex-col items-center",
    cupWrapper: "relative mb-8 flex size-32 items-center justify-center",
    cupBase: "absolute inset-0 text-brand/20",
    cupFill: "absolute inset-0 text-brand animate-liquid-fill",
    title: "text-title font-bold text-charcoal text-balance",
    description: "mt-3 max-w-sm text-body text-taupe text-balance",
  },
} as const;

export function LoadingPage(props: LoadingPageProps) {
  const s = useStrings(strings);

  if (props.kind === "menu") {
    return (
      <section role="status" aria-live="polite" className={styles.menu.section}>
        <Background />
        <style>{LIQUID_FILL_CSS}</style>

        <div className={styles.menu.content}>
          <div className={styles.menu.cupWrapper} aria-hidden="true">
            <Icon name="cup" size={128} className={styles.menu.cupBase} />
            <Icon name="cup" size={128} className={styles.menu.cupFill} />
          </div>
          <h2 className={styles.menu.title}>{s.menu.title}</h2>
          {s.menu.description && (
            <p className={styles.menu.description}>{s.menu.description}</p>
          )}
        </div>
      </section>
    );
  } else {
    return (
      <div role="status" aria-live="polite" className={styles.spinner.root}>
        <Background />
        <span aria-hidden="true" className={styles.spinner.ring} />
        <span className={styles.spinner.label}>{s.label}</span>
      </div>
    );
  }
}
