import { useMemo, useState } from "react";
import { Button, Checkbox, Input, SearchField } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { FIELD, FOCUS_RING } from "../../control-styles";
import { strings } from "../../strings";

export interface PickerItem {
  id: number;
  label: string;
}

interface PickerListProps {
  items: readonly PickerItem[];
  selectedIds: readonly number[];
  onChange: (ids: number[]) => void;
  searchPlaceholder: string;
  emptyLabel: string;
}

const STYLES = {
  wrap: "flex flex-col",
  // The search and the counts stay visible while the long list scrolls under them.
  sticky: "sticky -top-1 z-10 -mx-1 flex flex-col gap-3 bg-cream px-1 pb-3 pt-2",
  search: "relative block",
  searchInput: `${FIELD.control} h-11 ps-9 pe-3`,
  searchIcon: "pointer-events-none absolute inset-y-0 start-3 flex items-center text-navy/60",
  bar: "flex items-center justify-between gap-3",
  count: "text-small font-bold text-navy/70 tabular-nums",
  actions: "flex items-center gap-1",
  action: `inline-flex h-9 items-center rounded-full px-3 text-small font-bold text-brand transition-colors ease-smooth hover:bg-brand/10 ${FOCUS_RING} data-disabled:pointer-events-none data-disabled:opacity-40`,
  list: "flex flex-col gap-1 rounded-md border border-navy/15 bg-white p-1",
  row: `group flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 transition-colors ease-smooth ${FOCUS_RING} hover:bg-cream data-selected:bg-brand/5`,
  box: "flex size-5 shrink-0 items-center justify-center rounded border border-navy/25 text-white transition-colors ease-smooth group-data-selected:border-brand group-data-selected:bg-brand",
  label: "min-w-0 flex-1 text-small text-navy group-data-selected:font-bold",
  empty: "px-3 py-6 text-center text-small text-navy/70",
} as const;

// Search plus checkboxes for picking many items. Select all and Clear all act on what the
// search currently shows, so you can type "cheesecake" and tick every match in one tap.
export function PickerList({ items, selectedIds, onChange, searchPlaceholder, emptyLabel }: PickerListProps) {
  const s = useStrings(strings).products.picker;
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(items.filter((item) => next.has(item.id)).map((item) => item.id));
  };

  const selectVisible = () => {
    const next = new Set(selected);
    for (const item of visible) next.add(item.id);
    onChange(items.filter((item) => next.has(item.id)).map((item) => item.id));
  };

  const clearVisible = () => {
    const hidden = new Set(visible.map((item) => item.id));
    onChange(selectedIds.filter((id) => !hidden.has(id)));
  };

  const visibleSelectedCount = visible.reduce((n, item) => n + (selected.has(item.id) ? 1 : 0), 0);

  return (
    <div className={STYLES.wrap}>
      <div className={STYLES.sticky}>
        <SearchField value={query} onChange={setQuery} aria-label={searchPlaceholder} className={STYLES.search}>
          <span className={STYLES.searchIcon}>
            <Icon name="search" size={16} />
          </span>
          <Input
            placeholder={searchPlaceholder}
            className={STYLES.searchInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
          />
        </SearchField>
        <div className={STYLES.bar}>
          <span className={STYLES.count} aria-live="polite">
            {s.selected(selectedIds.length)}
          </span>
          <div className={STYLES.actions}>
            <Button
              isDisabled={visible.length === 0 || visibleSelectedCount === visible.length}
              onPress={selectVisible}
              className={STYLES.action}
            >
              {s.selectAll}
            </Button>
            <Button isDisabled={visibleSelectedCount === 0} onPress={clearVisible} className={STYLES.action}>
              {s.clearAll}
            </Button>
          </div>
        </div>
      </div>

      <div className={STYLES.list}>
        {visible.length === 0 && <p className={STYLES.empty}>{items.length === 0 ? emptyLabel : s.noMatches}</p>}
        {visible.map((item) => (
          <Checkbox key={item.id} isSelected={selected.has(item.id)} onChange={() => toggle(item.id)} className={STYLES.row}>
            <span className={STYLES.box}>
              <Icon name="check" size={13} strokeWidth={2.5} className="opacity-0 group-data-selected:opacity-100" />
            </span>
            <span className={STYLES.label}>{item.label}</span>
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
