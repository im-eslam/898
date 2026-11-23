import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Background } from "../components/background";
import { strings } from "./strings";

interface ErrorPageProps {
  kind: "network" | "generic";
  onRetry: () => void;
}

const styles = {
  page: "relative isolate flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center",
  content: "flex w-full max-w-md flex-col items-center",
  code: "text-[clamp(5rem,30vw,8rem)] leading-none font-bold tracking-tight text-brand",
  title: "mt-5 text-title font-bold text-charcoal text-balance",
  message: "mt-3 max-w-xs text-body text-taupe text-balance",
  button:
    "mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-small font-bold text-white transition-colors duration-base ease-smooth [@media(hover:hover)_and_(pointer:fine)]:hover:bg-navy active:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-pressed:opacity-80",
} as const;

export function ErrorPage(props: ErrorPageProps) {
  const s = useStrings(strings);
  const copy = props.kind === "network" ? s.network : s.generic;

  return (
    <main className={styles.page}>
      <Background />
      <div className={styles.content}>
        <p className={styles.code}>!</p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.message}>{copy.description}</p>
        <Button onPress={props.onRetry} className={styles.button}>
          {s.retry}
        </Button>
      </div>
    </main>
  );
}
