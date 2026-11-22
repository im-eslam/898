import { HeaderCategoryBar } from "./header-category-bar";
import { HeaderLanguageToggle } from "./header-language-toggle";
import { HeaderTopBar } from "./header-top-bar";

export interface HeaderTab {
  id: string;
  label: string;
}

interface MenuHeaderProps {
  tabs: HeaderTab[];
  activeId: string;
  direction: "ltr" | "rtl";
  onSelect: (sectionId: string) => void;
  onSearch: () => void;
  onCategories: () => void;
  onToggleLanguage: () => void;
}

const STYLES = {
  header: "sticky top-0 z-40 border-b border-sand/40 bg-cream",
  topRow: "mx-auto flex h-14 w-full max-w-5xl items-center gap-1",
} as const;

export function Header(props: MenuHeaderProps) {
  return (
    <header className={STYLES.header}>
      <div className={STYLES.topRow}>
        <HeaderTopBar onSearch={props.onSearch} />
        <HeaderLanguageToggle
          onToggle={props.onToggleLanguage}
          className="me-2 md:me-4"
        />
      </div>
      <HeaderCategoryBar
        tabs={props.tabs}
        activeId={props.activeId}
        direction={props.direction}
        onSelect={props.onSelect}
        onOpenCategories={props.onCategories}
      />
    </header>
  );
}
