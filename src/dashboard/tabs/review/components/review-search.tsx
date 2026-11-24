import { Button, Input, SearchField } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { CONTROL_STYLES } from "../control-styles";
import { strings } from "../strings";

const STYLES = {
  root: "relative w-full",
  icon: "pointer-events-none absolute inset-y-0 start-4 my-auto text-charcoal/60",
  clear:
    "absolute inset-y-0 end-1.5 my-auto inline-flex size-8 items-center justify-center rounded-full bg-cream text-charcoal outline-none focus-visible:outline-2 focus-visible:outline-brand [@media(hover:hover)_and_(pointer:fine)]:hover:bg-arctic",
} as const;

interface ReviewSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReviewSearch({ value, onChange }: ReviewSearchProps) {
  const s = useStrings(strings);

  return (
    <SearchField aria-label={s.search.label} value={value} onChange={onChange} className={STYLES.root}>
      {({ isEmpty }) => (
        <>
          <Icon name="search" size={18} className={STYLES.icon} />
          <Input placeholder={s.search.placeholder} className={CONTROL_STYLES.input} />
          {!isEmpty && (
            <Button aria-label={s.search.clear} className={STYLES.clear}>
              <Icon name="close" size={14} />
            </Button>
          )}
        </>
      )}
    </SearchField>
  );
}
