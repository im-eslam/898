import { Icon } from "@/shared/icons";

interface SelectBoxProps {
  isSelected: boolean;
  isIndeterminate?: boolean;
  isFocusVisible?: boolean;
}

const STYLES = {
  base: "flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ease-smooth",
  on: "border-brand bg-brand text-white",
  off: "border-charcoal/50 bg-white",
  focus: "outline-2 outline-offset-2 outline-brand",
  dash: "h-0.5 w-3 rounded bg-white",
} as const;

export function SelectBox({ isSelected, isIndeterminate = false, isFocusVisible = false }: SelectBoxProps) {
  const isOn = isSelected || isIndeterminate;

  return (
    <span
      aria-hidden="true"
      className={`${STYLES.base} ${isOn ? STYLES.on : STYLES.off} ${isFocusVisible ? STYLES.focus : ""}`}
    >
      {isIndeterminate ? (
        <span className={STYLES.dash} />
      ) : isSelected ? (
        <Icon name="check" size={16} />
      ) : null}
    </span>
  );
}
