import { useStrings } from "@/shared/i18n";
import { Background } from "../components/background";
import { strings } from "./strings";

const styles = {
  root: "fixed inset-0 isolate flex items-center justify-center",
  spinner:
    "size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand motion-reduce:animate-[spin_3s_linear_infinite]",
  label: "sr-only",
} as const;

export function LoadingPage() {
  const s = useStrings(strings);

  return (
    <div role="status" aria-live="polite" className={styles.root}>
      <Background />
      <span aria-hidden="true" className={styles.spinner} />
      <span className={styles.label}>{s.label}</span>
    </div>
  );
}
