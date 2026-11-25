import { useMemo, useState } from "react";
import { Checkbox, Input, SearchField } from "react-aria-components";
import { Icon } from "@/shared/icons";

export interface ChecklistItem {
  id: number;
  label: string;
  hint?: string;
}

interface ChecklistFieldProps {
  label: string;
  items: ChecklistItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabledIds?: number[];
  searchPlaceholder?: string;
  emptyLabel: string;
}

const STYLES = {
  field: "flex flex-col gap-1.5",
  label: "text-small font-bold text-navy",
  search: "relative",
  searchInput:
    "h-10 w-full rounded-md border border-navy/15 bg-white ps-9 pe-3 text-small text-navy outline-none transition-colors ease-smooth focus:border-brand",
  searchIcon:
    "pointer-events-none absolute inset-y-0 start-3 flex items-center text-navy/40",
  list: "flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-md border border-navy/15 bg-white p-1",
  row: "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 outline-none transition-colors ease-smooth data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-disabled:cursor-not-allowed data-disabled:opacity-40 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-cream",
  box: "flex size-5 shrink-0 items-center justify-center rounded border border-navy/25 text-white transition-colors ease-smooth group-data-selected:border-brand group-data-selected:bg-brand",
  rowLabel: "min-w-0 flex-1 truncate text-small text-navy",
  rowHint: "shrink-0 text-caption text-navy/50",
  empty: "px-2.5 py-4 text-center text-small text-navy/50",
} as const;

export function ChecklistField({
  label,
  items,
  selectedIds,
  onChange,
  disabledIds = [],
  searchPlaceholder,
  emptyLabel,
}: ChecklistFieldProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const disabled = useMemo(() => new Set(disabledIds), [disabledIds]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  return (
    <div className={STYLES.field}>
      <span className={STYLES.label}>{label}</span>
      {searchPlaceholder && (
        <SearchField
          value={query}
          onChange={setQuery}
          aria-label={searchPlaceholder}
          className={STYLES.search}
        >
          <span className={STYLES.searchIcon}>
            <Icon name="search" size={16} />
          </span>
          <Input placeholder={searchPlaceholder} className={STYLES.searchInput} />
        </SearchField>
      )}
      <div className={STYLES.list}>
        {visible.length === 0 && <p className={STYLES.empty}>{emptyLabel}</p>}
        {visible.map((item) => (
          <Checkbox
            key={item.id}
            isSelected={selected.has(item.id)}
            isDisabled={disabled.has(item.id)}
            onChange={() => toggle(item.id)}
            className={`group ${STYLES.row}`}
          >
            <span className={STYLES.box}>
              <Icon
                name="check"
                size={13}
                strokeWidth={2.5}
                className="opacity-0 group-data-selected:opacity-100"
              />
            </span>
            <span className={STYLES.rowLabel}>{item.label}</span>
            {item.hint && <span className={STYLES.rowHint}>{item.hint}</span>}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
