import { useMemo, useState } from "react";
import { Input, ListBox, ListBoxItem, SearchField } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { FIELD, FOCUS_RING } from "../../control-styles";
import { strings } from "../../strings";
import { MenuDialog } from "../menu-dialog";
import { FormFooter } from "../form-footer";

export interface SignaturePickerOption {
  id: number;
  label: string;
  searchText: string;
  meta: string;
  imageUrl: string | null;
}

interface SignaturePickerDialogProps {
  isOpen: boolean;
  options: SignaturePickerOption[];
  onClose: () => void;
  onConfirm: (ids: number[]) => void;
}

const STYLES = {
  searchIcon: "pointer-events-none absolute inset-y-0 start-3 flex items-center text-navy/60",
  searchInput: `${FIELD.control} h-11 ps-9 pe-3`,
  // Fits the viewport on phones and stays at a fixed height on larger screens.
  list: "flex max-h-[min(50dvh,20rem)] flex-col gap-1 overflow-y-auto overscroll-contain",
  row: `group flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-transparent bg-white px-2.5 py-2 transition-colors ease-smooth ${FOCUS_RING} hover:bg-cream data-selected:border-brand/40 data-selected:bg-brand/5`,
  thumb: "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-navy/10 bg-cream",
  image: "size-full object-cover",
  text: "min-w-0 flex-1",
  name: "block truncate text-small font-bold text-navy",
  meta: "block truncate text-caption text-navy/70",
  box: "flex size-6 shrink-0 items-center justify-center rounded-md border border-navy/25 text-white transition-colors ease-smooth group-data-selected:border-brand group-data-selected:bg-brand",
  empty: "px-3 py-8 text-center text-small text-navy/70",
} as const;

// Search products and tick several to feature at once.
export function SignaturePickerDialog({ isOpen, options, onClose, onConfirm }: SignaturePickerDialogProps) {
  const s = useStrings(strings);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.searchText.includes(q)) : options;
  }, [options, query]);

  const submit = () => {
    if (selected.length > 0) onConfirm(selected);
  };

  return (
    <MenuDialog
      isOpen={isOpen}
      size="md"
      title={s.signatures.pickerTitle}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <FormFooter
          isSaving={false}
          isSubmitDisabled={selected.length === 0}
          submitLabel={s.signatures.pickerAdd(selected.length)}
          onCancel={onClose}
        />
      }
    >
      <div className="flex flex-col gap-3">
        <SearchField value={query} onChange={setQuery} aria-label={s.signatures.pickerSearch} className="relative block">
          <span className={STYLES.searchIcon}>
            <Icon name="search" size={16} />
          </span>
          <Input
            placeholder={s.signatures.pickerSearch}
            className={STYLES.searchInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
          />
        </SearchField>

        <p className="text-small font-bold text-navy/70" aria-live="polite">
          {s.signatures.selectedCount(selected.length)}
        </p>

        <ListBox
          aria-label={s.signatures.pickerTitle}
          items={visible}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={(keys) => {
            if (keys === "all") {
              setSelected(options.map((o) => o.id));
              return;
            }
            setSelected([...keys].map(Number));
          }}
          renderEmptyState={() => (
            <p className={STYLES.empty}>{options.length === 0 ? s.signatures.pickerAllAdded : s.signatures.pickerEmpty}</p>
          )}
          className={STYLES.list}
          style={{ maxHeight: "min(50dvh, 20rem)" }}
        >
          {(option) => (
            <ListBoxItem id={option.id} textValue={option.label} className={STYLES.row}>
              <span className={STYLES.thumb}>
                {option.imageUrl && (
                  <img src={option.imageUrl} alt="" loading="lazy" decoding="async" className={STYLES.image} />
                )}
              </span>
              <span className={STYLES.text}>
                <span className={STYLES.name}>{option.label}</span>
                <span className={STYLES.meta}>{option.meta}</span>
              </span>
              <span className={STYLES.box}>
                <Icon name="check" size={13} strokeWidth={2.5} className="opacity-0 group-data-selected:opacity-100" />
              </span>
            </ListBoxItem>
          )}
        </ListBox>
      </div>
    </MenuDialog>
  );
}
