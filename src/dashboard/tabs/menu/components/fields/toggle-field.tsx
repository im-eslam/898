import { Switch } from "react-aria-components";

interface ToggleFieldProps {
  label: string;
  hint?: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  isDisabled?: boolean;
}

const STYLES = {
  switch:
    "group flex w-full items-center justify-between gap-4 rounded-md py-1 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-disabled:opacity-50",
  text: "flex min-w-0 flex-col gap-0.5",
  label: "text-small font-bold text-navy",
  hint: "text-caption text-navy/70",
  track:
    "relative h-7 w-12 shrink-0 rounded-full bg-navy/20 transition-colors ease-smooth group-data-selected:bg-brand",
  thumb:
    "absolute top-0.5 start-0.5 size-6 rounded-full border border-navy/15 bg-white transition-transform ease-smooth group-data-selected:translate-x-5 rtl:group-data-selected:-translate-x-5",
} as const;

export function ToggleField({ label, hint, isSelected, onChange, isDisabled }: ToggleFieldProps) {
  return (
    <Switch isSelected={isSelected} onChange={onChange} isDisabled={isDisabled} className={STYLES.switch}>
      <span className={STYLES.text}>
        <span className={STYLES.label}>{label}</span>
        {hint && <span className={STYLES.hint}>{hint}</span>}
      </span>
      <span className={STYLES.track}>
        <span className={STYLES.thumb} />
      </span>
    </Switch>
  );
}
