import { Button, Input, Label, SearchField } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../../strings";
import { CloseButton } from "../ui/close-button";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

const STYLES = {
  topBar:
    "flex items-center gap-1 border-b border-arctic ps-4 pe-2 md:ps-6 md:pe-4",
  field: "group relative my-2 flex h-12 min-w-0 flex-1 items-center",
  fieldLabel: "sr-only",
  fieldIcon: "pointer-events-none absolute start-4 size-5",
  input:
    "h-12 w-full appearance-none rounded-full border border-arctic bg-paper ps-12 pe-11 text-body outline-none transition-colors duration-fast placeholder:text-navy/55 focus:bg-white data-focus-visible:border-navy [&::-webkit-search-cancel-button]:hidden",
  clear:
    "absolute end-1 flex size-11 items-center justify-center rounded-full outline-none touch-manipulation group-data-empty:hidden data-hovered:bg-paper data-pressed:bg-arctic data-focus-visible:outline-2 data-focus-visible:outline-brand",
} as const;

export function SearchBar(props: SearchBarProps) {
  const { search } = useStrings(strings);

  return (
    <div className={STYLES.topBar}>
      <SearchField
        autoFocus
        value={props.query}
        onChange={props.onChange}
        className={STYLES.field}
      >
        <Label className={STYLES.fieldLabel}>{search.label}</Label>
        <Icon name="search" className={STYLES.fieldIcon} />
        <Input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder={search.placeholder}
          className={STYLES.input}
        />
        <Button aria-label={search.clear} className={STYLES.clear}>
          <Icon name="close" className="size-4" />
        </Button>
      </SearchField>
      <CloseButton onPress={props.onClose} />
    </div>
  );
}
