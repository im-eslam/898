import { Button, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { Toaster } from "react-hot-toast";
import { useStrings } from "@/shared/i18n";
import { ApiError } from "@/shared/api";
import { CONTROL_STYLES, FOCUS_RING, SPINNER } from "./control-styles";
import { AddOnList } from "./components/sections/add-on-list";
import { CategoryList } from "./components/sections/category-list";
import { PairingsSection } from "./components/sections/pairings-section";
import { PopupSection } from "./components/sections/popup-section";
import { ProductsSection } from "./components/sections/products-section";
import { SignaturesSection } from "./components/sections/signatures-section";
import { useAdminMenu } from "./hooks/use-admin-menu";
import { getErrorMessage } from "./lib/get-error-message";
import { strings } from "./strings";

// Hoisted: these objects used to be recreated on every render.
const TOAST_OPTIONS = {
  duration: 3500,
  className: "text-small font-bold text-navy",
  style: { boxShadow: "none" },
} as const;

const STYLES = {
  page: "mx-auto flex w-full max-w-4xl min-w-0 flex-col gap-6",
  header: "flex flex-col gap-1",
  title: "text-title font-bold text-balance text-navy",
  tabs: "flex min-w-0 flex-col gap-5",
  // Scrolls sideways on phones with no visible scrollbar. Centred on wider screens.
  tabList:
    "flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain p-1 sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  panel: "min-w-0 outline-none",
  loading:
    "flex min-h-40 items-center justify-center rounded-lg border border-navy/10 bg-white text-small text-navy/70",
  error:
    "flex flex-col items-start gap-3 rounded-lg border border-error/20 bg-white p-5 text-small text-error",
  retry: `inline-flex h-11 items-center rounded-full bg-brand px-5 font-bold text-white hover:bg-navy ${FOCUS_RING}`,
} as const;

// For the admin sidebar. The shell renders this item; the label follows the app language.
// Usage: <NavItem icon="menu" label={menuNav.label} onClick={...} />
export const menuNav = {
  id: "menu",
  label: { en: strings.en.title, ar: strings.ar.title },
} as const;

// Shape the admin tab registry expects: one label per language.
export const menuTabStrings = {
  en: { label: strings.en.title },
  ar: { label: strings.ar.title },
} as const;

export function MenuTab() {
  const s = useStrings(strings);
  const menuQuery = useAdminMenu();

  return (
    <section className={STYLES.page}>
      <Toaster position="top-center" toastOptions={TOAST_OPTIONS} />

      <header className={STYLES.header}>
        <h1 className={STYLES.title}>{s.title}</h1>
      </header>

      {menuQuery.isPending && (
        <div role="status" aria-live="polite" className={STYLES.loading}>
          <span className={SPINNER} />
          <span className="sr-only">{s.loading}</span>
        </div>
      )}

      {menuQuery.isError && (
        <div role="alert" className={STYLES.error}>
          <p>
            {s.loadFailed}{" "}
            {menuQuery.errorCode
              ? getErrorMessage(s.errors, new ApiError(0, menuQuery.errorCode, ""))
              : s.errors.UNKNOWN}
          </p>
          <Button
            onPress={menuQuery.retry}
            className={STYLES.retry}
          >
            {s.retry}
          </Button>
        </div>
      )}

      {menuQuery.menu && (
        <Tabs defaultSelectedKey="categories" className={STYLES.tabs}>
          <TabList aria-label={s.title} className={STYLES.tabList}>
            <Tab id="categories" className={CONTROL_STYLES.pill}>{s.nav.categories}</Tab>
            <Tab id="products" className={CONTROL_STYLES.pill}>{s.nav.products}</Tab>
            <Tab id="addOns" className={CONTROL_STYLES.pill}>{s.nav.addOns}</Tab>
            <Tab id="pairings" className={CONTROL_STYLES.pill}>{s.nav.pairings}</Tab>
            <Tab id="signatures" className={CONTROL_STYLES.pill}>{s.nav.signatures}</Tab>
            <Tab id="popup" className={CONTROL_STYLES.pill}>{s.nav.popup}</Tab>
          </TabList>

          <TabPanel id="categories" className={STYLES.panel}>
            <CategoryList categories={menuQuery.menu.categories} products={menuQuery.menu.products} />
          </TabPanel>
          <TabPanel id="products" className={STYLES.panel}>
            <ProductsSection menu={menuQuery.menu} />
          </TabPanel>
          <TabPanel id="addOns" className={STYLES.panel}>
            <AddOnList addOns={menuQuery.menu.addOns} />
          </TabPanel>
          <TabPanel id="pairings" className={STYLES.panel}>
            <PairingsSection menu={menuQuery.menu} />
          </TabPanel>
          <TabPanel id="signatures" className={STYLES.panel}>
            <SignaturesSection menu={menuQuery.menu} />
          </TabPanel>
          <TabPanel id="popup" className={STYLES.panel}>
            <PopupSection popup={menuQuery.menu.popup} />
          </TabPanel>
        </Tabs>
      )}
    </section>
  );
}
