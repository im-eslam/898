import { useState } from "react";
import { Button, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { ApiError } from "@/shared/api";
import { CategoriesProductsSection } from "./components/sections/categories-products-section";
import { AddOnList } from "./components/sections/add-on-list";
import { PairingsSection } from "./components/sections/pairings-section";
import { PopupSection } from "./components/sections/popup-section";
import { SignaturesSection } from "./components/sections/signatures-section";
import { useAdminMenu } from "./hooks/use-admin-menu";
import { getErrorMessage } from "./lib/get-error-message";
import { strings } from "./strings";

const STYLES = {
  page: "flex w-full flex-col gap-5",
  title: "text-title font-bold text-balance text-navy",
  description: "text-body text-balance text-navy/80",
  tabs: "flex flex-col gap-5",
  tabList: "flex w-full gap-2 overflow-x-auto pb-1",
  tab: "inline-flex h-10 shrink-0 items-center rounded-full border border-navy/15 bg-white px-4 text-small font-bold text-navy/70 outline-none transition-colors ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-selected:border-brand data-selected:bg-brand data-selected:text-white",
  panel: "min-w-0",
  loading:
    "flex min-h-40 items-center justify-center rounded-lg border border-navy/10 bg-white text-small text-navy/70",
  error:
    "flex flex-col items-start gap-3 rounded-lg border border-error/20 bg-white p-5 text-small text-error",
} as const;

export function MenuTab() {
  const s = useStrings(strings);
  const menuQuery = useAdminMenu();
  const [selectedTab, setSelectedTab] = useState("categories");

  return (
    <section className={STYLES.page}>
      <header>
        <h1 className={STYLES.title}>{s.title}</h1>
        <p className={STYLES.description}>{s.description}</p>
      </header>

      {menuQuery.isPending && (
        <div role="status" aria-live="polite" className={STYLES.loading}>
          <span className="size-6 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
          <span className="sr-only">{s.loading}</span>
        </div>
      )}

      {menuQuery.isError && (
        <div role="alert" className={STYLES.error}>
          <p>
            {s.loadFailed}{" "}
            {menuQuery.errorCode
              ? getErrorMessage(
                  s.errors,
                  new ApiError(0, menuQuery.errorCode, "")
                )
              : s.errors.UNKNOWN}
          </p>
          <Button
            onPress={menuQuery.retry}
            className="rounded-full bg-brand px-4 py-2 font-bold text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {s.retry}
          </Button>
        </div>
      )}

      {menuQuery.menu && (
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(String(key))}
          className={STYLES.tabs}
        >
          <TabList aria-label={s.title} className={STYLES.tabList}>
            <Tab id="categories" className={STYLES.tab}>
              {s.nav.categories}
            </Tab>
            <Tab id="addOns" className={STYLES.tab}>
              {s.nav.addOns}
            </Tab>
            <Tab id="pairings" className={STYLES.tab}>
              {s.nav.pairings}
            </Tab>
            <Tab id="signatures" className={STYLES.tab}>
              {s.nav.signatures}
            </Tab>
            <Tab id="popup" className={STYLES.tab}>
              {s.nav.popup}
            </Tab>
          </TabList>

          <TabPanel id="categories" className={STYLES.panel}>
            {selectedTab === "categories" && (
              <CategoriesProductsSection menu={menuQuery.menu} />
            )}
          </TabPanel>
          <TabPanel id="addOns" className={STYLES.panel}>
            {selectedTab === "addOns" && (
              <AddOnList addOns={menuQuery.menu.addOns} />
            )}
          </TabPanel>
          <TabPanel id="pairings" className={STYLES.panel}>
            {selectedTab === "pairings" && (
              <PairingsSection menu={menuQuery.menu} />
            )}
          </TabPanel>
          <TabPanel id="signatures" className={STYLES.panel}>
            {selectedTab === "signatures" && (
              <SignaturesSection menu={menuQuery.menu} />
            )}
          </TabPanel>
          <TabPanel id="popup" className={STYLES.panel}>
            {selectedTab === "popup" && (
              <PopupSection popup={menuQuery.menu.popup} />
            )}
          </TabPanel>
        </Tabs>
      )}
    </section>
  );
}
