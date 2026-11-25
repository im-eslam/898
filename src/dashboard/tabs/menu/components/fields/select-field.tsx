import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { FOCUS_RING } from "../../control-styles";
import { useSheetContainer } from "../sheet-context";

export interface SelectOption {
  id: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  trigger: `group flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-navy/15 bg-white px-4 text-body text-navy transition-colors ease-smooth data-pressed:border-brand ${FOCUS_RING} focus-visible:border-brand`,
  value: "flex-1 truncate text-start",
  chevron: "shrink-0 text-navy/70 rotate-90",
  popover: "w-(--trigger-width) overflow-hidden rounded-md border border-navy/15 bg-white",
  listbox: "max-h-60 overflow-auto overscroll-contain p-1 outline-none",
  item:
    "flex min-h-11 cursor-pointer items-center rounded-md px-3 text-body text-navy outline-none data-focused:bg-brand/10 data-selected:font-bold",
} as const;

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const sheet = useSheetContainer();
  return (
    <Select selectedKey={value} onSelectionChange={(key) => onChange(String(key))} className={STYLES.field}>
      <Label className={STYLES.label}>{label}</Label>
      <Button className={STYLES.trigger}>
        <SelectValue className={STYLES.value} />
        <Icon name="arrow" size={16} className={STYLES.chevron} />
      </Button>
      <Popover className={STYLES.popover} UNSTABLE_portalContainer={sheet ?? undefined}>
        <ListBox className={STYLES.listbox} items={options}>
          {(option) => (
            <ListBoxItem id={option.id} textValue={option.label} className={STYLES.item}>
              {option.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}
