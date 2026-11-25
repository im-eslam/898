import { useId } from "react";
import { FIELD } from "../../control-styles";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  hint?: string;
  error?: string;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  wrap: "relative",
  // Hides the spinner arrows. Typing is the input method here.
  input: `${FIELD.control} py-2.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`,
  suffix:
    "pointer-events-none absolute inset-y-0 end-3 flex items-center text-small font-bold text-navy/70",
} as const;

// A plain number input. The text is selected on focus, so on a phone you can type
// straight over the old value instead of deleting the 0 first.
export function NumberInputField({ label, value, onChange, min = 0, max = 100_000, suffix, hint, error }: NumberFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={STYLES.field}>
      <label htmlFor={id} className={FIELD.label}>
        {label}
      </label>
      <div className={STYLES.wrap}>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          dir="ltr"
          value={Number.isFinite(value) ? value : 0}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const next = Math.round(Number(event.target.value));
            onChange(Number.isFinite(next) ? Math.min(Math.max(next, min), max) : min);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${STYLES.input} ps-3 ${suffix ? "pe-14" : "pe-3"}`}
        />
        {suffix && <span className={STYLES.suffix}>{suffix}</span>}
      </div>
      {hint && <span className={FIELD.hint}>{hint}</span>}
      {error && (
        <p id={errorId} role="alert" className={FIELD.error}>
          {error}
        </p>
      )}
    </div>
  );
}
