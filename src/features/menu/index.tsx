import { Suspense, lazy, useEffect } from "react";
import { ErrorPage } from "@/features/states/error/";
import { LoadingPage } from "@/features/states/loading/";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import type { MenuDto } from "@api/contracts";
import { Header as MenuHeader } from "./components/header/header";
import { PairingsSection } from "./components/sections/pairings/pairings-section";
import { ProductsSection } from "./components/sections/products/products-section";
import { SignaturesSection } from "./components/sections/signatures/signatures-section";
import { useMenu } from "./hooks/use-menu";
import { useData } from "./hooks/use-data";
import { strings } from "./strings";
import { MenuLookup } from "./util/menu";
import { categoryId } from "./util/section";

const loadSearchOverlay = () =>
  import("./components/overlays/search-overlay").then((m) => ({
    default: m.SearchOverlay,
  }));
const loadPromoPopup = () =>
  import("./components/overlays/promo-popup").then((m) => ({
    default: m.PromoPopup,
  }));
const loadCategorySheet = () =>
  import("./components/sheets/categories/category-sheet").then((m) => ({
    default: m.CategorySheet,
  }));
const loadItemSheet = () =>
  import("./components/sheets/items/item-sheet").then((m) => ({
    default: m.ItemSheet,
  }));

const preloadOverlays = [
  loadSearchOverlay,
  loadPromoPopup,
  loadCategorySheet,
  loadItemSheet,
];

const SearchOverlay = lazy(loadSearchOverlay);
const PromoPopup = lazy(loadPromoPopup);
const CategorySheet = lazy(loadCategorySheet);
const ItemSheet = lazy(loadItemSheet);

interface MenuReadyProps {
  menu: MenuDto;
}

const STYLES = {
  page: "min-h-dvh pb-10",
  srOnly: "sr-only",
} as const;

function MenuReady(props: MenuReadyProps) {
  const { page } = useStrings(strings);
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";

  const { tabs, activeId, select, panels } = useMenu(props.menu);

  useEffect(() => {
    for (const load of preloadOverlays) void load();
  }, []);

  return (
    <div dir={direction} className={STYLES.page}>
      <MenuHeader
        tabs={tabs}
        activeId={activeId}
        direction={direction}
        onSelect={select}
        onSearch={panels.actions.openSearch}
        onCategories={panels.actions.openCategories}
        onToggleLanguage={() => setLocale(locale === "en" ? "ar" : "en")}
      />

      <main>
        <h1 className={STYLES.srOnly}>{page.title}</h1>

        {props.menu.signatures.length > 0 && (
          <SignaturesSection
            products={props.menu.signatures}
            onOpen={panels.actions.openProduct}
          />
        )}

        {props.menu.pairings.length > 0 && (
          <PairingsSection
            pairings={props.menu.pairings}
            onOpen={panels.actions.openPairing}
          />
        )}

        {props.menu.categories.map((category) => (
          <ProductsSection
            key={categoryId(category)}
            category={category}
            onOpen={panels.actions.openProduct}
          />
        ))}
      </main>

      <Suspense fallback={null}>
        <SearchOverlay
          menu={props.menu}
          isOpen={panels.state.panel === "search"}
          onClose={panels.actions.close}
          onPickSection={select}
          onOpenPairing={panels.actions.openPairing}
          onOpenProduct={panels.actions.openProduct}
        />

        <CategorySheet
          categories={props.menu.categories}
          activeId={activeId}
          isOpen={panels.state.panel === "categories"}
          onClose={panels.actions.close}
          onPick={select}
        />

        {panels.state.source && (
          <ItemSheet
            source={panels.state.source}
            optionIds={panels.state.optionIds}
            addOnIds={panels.state.addOnIds}
            isOpen={panels.state.panel === "item"}
            onClose={panels.actions.close}
            onSelectSize={panels.actions.selectSize}
            onSetBarista={panels.actions.setBarista}
            onSetAddOns={panels.actions.setAddOns}
            onOpenReference={(productId) => {
              const product = MenuLookup.product(props.menu, productId);
              if (product) panels.actions.openProduct(product);
            }}
          />
        )}

        <PromoPopup
          popup={props.menu.popup}
          busy={panels.state.panel !== "none"}
        />
      </Suspense>
    </div>
  );
}

export function MenuPage() {
  const query = useData();

  if (query.menu) return <MenuReady menu={query.menu} />;

  if (query.isError) {
    return (
      <ErrorPage
        kind={query.errorCode === "NETWORK" ? "network" : "generic"}
        onRetry={query.retry}
      />
    );
  }

  return <LoadingPage kind="menu" />;
}
