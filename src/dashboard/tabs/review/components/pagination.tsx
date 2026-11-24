import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { CONTROL_STYLES } from "../control-styles";
import { fill } from "../lib/fill";
import { strings } from "../strings";

const STYLES = {
  nav: "flex items-center justify-between gap-3",
  info: "text-small font-bold text-charcoal",
} as const;

interface PaginationProps {
  page: number;
  totalPages: number;
  isDisabled: boolean;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, isDisabled, onChange }: PaginationProps) {
  const s = useStrings(strings);

  return (
    <nav aria-label={s.pagination.label} className={STYLES.nav}>
      <Button isDisabled={isDisabled || page <= 1} onPress={() => onChange(page - 1)} className={CONTROL_STYLES.button}>
        {s.pagination.previous}
      </Button>
      <span aria-live="polite" className={STYLES.info}>
        {fill(s.pagination.info, { page, total: totalPages })}
      </span>
      <Button isDisabled={isDisabled || page >= totalPages} onPress={() => onChange(page + 1)} className={CONTROL_STYLES.button}>
        {s.pagination.next}
      </Button>
    </nav>
  );
}
