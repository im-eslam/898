import { Button, ComboBox, Input, Label, ListBox, ListBoxItem, Popover } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { FOCUS_RING } from "../../control-styles";
import { useSheetContainer } from "../sheet-context";

export interface SearchSelectOption {
  id: string;
  label: string;
}

interface SearchSelectFieldProps {
  label: string;
  value: string | null;
  options: readonly SearchSelectOption[];
  onChange: (id: string | null) => void;
  placeholder: string;
  emptyLabel: string;
  error?: string;
}

const STYLES = {
  field: "group flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  box: "flex min-h-11 w-full items-center rounded-md border border-navy/15 bg-white ps-3 pe-1 transition-colors ease-smooth focus-within:border-brand group-data-invalid:border-error",
  input: "min-w-0 flex-1 bg-transparent py-2.5 text-body text-navy outline-none placeholder:text-navy/60",
  button: `inline-flex size-10 shrink-0 items-center justify-center rounded-full text-navy/70 transition-colors ease-smooth hover:bg-navy/5 ${FOCUS_RING}`,
  popover: "w-(--trigger-width) overflow-hidden rounded-md border border-navy/15 bg-white",
  listbox: "max-h-60 overflow-auto overscroll-contain p-1 outline-none",
  item:
    "flex min-h-11 cursor-pointer items-center rounded-md px-3 text-body text-navy outline-none data-focused:bg-brand/10 data-selected:font-bold",
  empty: "px-3 py-4 text-center text-small text-navy/70",
  error: "text-small font-bold text-error",
} as const;

// A dropdown you can type into to filter products.
export function SearchSelectField({ label, value, options, onChange, placeholder, emptyLabel, error }: SearchSelectFieldProps) {
  const sheet = useSheetContainer();
  return (
    <ComboBox
      selectedKey={value}
      onSelectionChange={(key) => onChange(key === null ? null : String(key))}
      defaultItems={options}
      menuTrigger="focus"
      allowsEmptyCollection
      isInvalid={Boolean(error)}
      className={STYLES.field}
    >
      <Label className={STYLES.label}>{label}</Label>
      <div className={STYLES.box}>
        <Input
          placeholder={placeholder}
          className={STYLES.input}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
        />
        <Button className={STYLES.button} aria-label={label}>
          <Icon name="arrow" size={16} className="rotate-90" />
        </Button>
      </div>
      <Popover className={STYLES.popover} UNSTABLE_portalContainer={sheet ?? undefined}>
        <ListBox renderEmptyState={() => <p className={STYLES.empty}>{emptyLabel}</p>} className={STYLES.listbox}>
          {(option: SearchSelectOption) => (
            <ListBoxItem id={option.id} textValue={option.label} className={STYLES.item}>
              {option.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
      {error && (
        <p role="alert" className={STYLES.error}>
          {error}
        </p>
      )}
    </ComboBox>
  );
}
