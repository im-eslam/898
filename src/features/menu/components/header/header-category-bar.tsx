import { useEffect, useRef } from "react";
import {
  Button,
  SelectionIndicator,
  Tab,
  TabList,
  Tabs,
} from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../../strings";
import { type HeaderTab } from "./header";

interface CategoryBarProps {
  tabs: HeaderTab[];
  activeId: string;
  direction: "ltr" | "rtl";
  onSelect: (sectionId: string) => void;
  onOpenCategories: () => void;
}

const STYLES = {
  row: "mx-auto flex h-12 w-full max-w-5xl items-center",
  menuSlot: "shrink-0 ps-1 md:ps-3",
  iconButton:
    "flex size-12 shrink-0 items-center justify-center rounded-full text-charcoal transition-colors duration-fast ease-smooth data-hovered:bg-sand/40 data-pressed:bg-sand/60 motion-reduce:transition-none",
  icon: "size-5",
  nav: "relative h-12 min-w-0 flex-1",
  tabs: "flex h-full w-full items-center",
  tabList:
    "no-scrollbar relative flex h-12 w-full touch-pan-x items-center gap-1 overflow-x-auto overscroll-x-contain px-4 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]",
  tab: "group relative flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full px-4 text-small text-charcoal/70 outline-none data-hovered:text-charcoal data-selected:text-cream",
  tabText: "relative z-10 font-medium group-data-selected:font-semibold",
  indicator:
    "absolute inset-0 z-0 rounded-full bg-brand transition-[translate,width] duration-base ease-smooth motion-reduce:transition-none",
} as const;

export function HeaderCategoryBar(props: CategoryBarProps) {
  const { header } = useStrings(strings);
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tab = tabListRef.current?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(props.activeId)}"]`
    );
    tab?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [props.activeId]);

  return (
    <div dir={props.direction} className={STYLES.row}>
      <div className={STYLES.menuSlot}>
        <Button
          aria-label={header.categories}
          onPress={props.onOpenCategories}
          className={STYLES.iconButton}
        >
          <Icon name="menu" className={STYLES.icon} />
        </Button>
      </div>

      <nav className={STYLES.nav}>
        <Tabs
          selectedKey={props.activeId}
          onSelectionChange={(key) => props.onSelect(String(key))}
          className={STYLES.tabs}
        >
          <TabList
            ref={tabListRef}
            aria-label={header.categories}
            className={STYLES.tabList}
          >
            {props.tabs.map((tab) => (
              <Tab key={tab.id} id={tab.id} className={STYLES.tab}>
                <span className={STYLES.tabText}>{tab.label}</span>
                <SelectionIndicator className={STYLES.indicator} />
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </nav>
    </div>
  );
}
