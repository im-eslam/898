import { useId } from "react";

interface MoneyFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currencySuffix: string;
  max?: number;
  error?: string;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  wrap: "relative",
  input:
    "w-full rounded-md border border-navy/15 bg-white py-2.5 ps-3 pe-14 text-body text-navy outline-none transition-colors ease-smooth focus:border-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  inputInvalid: "border-error",
  suffix:
    "pointer-events-none absolute inset-y-0 end-3 flex items-center text-small font-bold text-navy/50",
  error: "text-small font-bold text-error",
} as const;

export function MoneyField({
  label,
  value,
  onChange,
  currencySuffix,
  max = 100_000,
  error,
}: MoneyFieldProps) {
  const id = useId();

  return (
    <div className={STYLES.field}>
      <label htmlFor={id} className={STYLES.label}>
        {label}
      </label>
      <div className={STYLES.wrap}>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          step={1}
          dir="ltr"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => {
            const next = Math.round(Number(event.target.value));
            onChange(Number.isFinite(next) ? Math.min(Math.max(next, 0), max) : 0);
          }}
          aria-invalid={Boolean(error)}
          className={`${STYLES.input} ${error ? STYLES.inputInvalid : ""}`}
        />
        <span className={STYLES.suffix}>{currencySuffix}</span>
      </div>
      {error && (
        <p role="alert" className={STYLES.error}>
          {error}
        </p>
      )}
    </div>
  );
}
