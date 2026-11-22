import { useMemo } from "react";
import { ErrorPage } from "@/features/states/error/";
import { LoadingPage } from "@/features/states/loading/";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import type { MenuDto } from "@api/contracts";
import { Header as MenuHeader, type HeaderTab } from "./components/header/header";
import { PromoPopup } from "./components/overlays/promo-popup";
import { SearchOverlay } from "./components/overlays/search/search";
import { ProductsSection as CategorySection } from "./components/sections/products/products-section";
import { PairingsSection } from "./components/sections/pairings/pairings-section";
import { SignaturesSection } from "./components/sections/signatures/signatures-section";
import { CategorySheet } from "./components/sheets/items/category-sheet";
import { ItemSheet } from "./components/sheets/items/item-sheet";
import { useMenuNav } from "./hooks/use-menu-nav";
import { useMenuQuery } from "./hooks/use-menu-query";
import { useMenuState } from "./hooks/use-menu-state";
import { strings } from "./strings";
import { MenuLookup } from "./util/menu";
import {
  PAIRINGS_ID,
  SIGNATURES_ID,
  categoryId,
  sectionIds,
} from "./util/section";

const STYLES = {
  page: "min-h-dvh pb-10",
  srOnly: "sr-only",
} as const;

/** Loads the menu, and shows the loading or error screen until it is ready. */
export function MenuPage() {
  const query = useMenuQuery();

  if (query.menu) return <MenuReady menu={query.menu} />;

  if (query.isError) {
    return (
      <ErrorPage
        kind={query.isNetworkError ? "network" : "generic"}
        onRetry={query.retry}
      />
    );
  }

  return <LoadingPage kind="menu" />;
}

interface MenuReadyProps {
  menu: MenuDto;
}

/** The menu page. It wires the hooks together and passes finished data to the sections. */
function MenuReady(props: MenuReadyProps) {
  const s = useStrings(strings);
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const { menu } = props;

  const ids = useMemo(() => sectionIds(menu), [menu]);
  const nav = useMenuNav(ids);
  const { state, actions } = useMenuState();

  // Jumping to a section closes whatever is open first.
  const select = (sectionId: string) => {
    actions.close();
    nav.select(sectionId);
  };

  const tabs: HeaderTab[] = [
    ...(menu.signatures.length > 0
      ? [{ id: SIGNATURES_ID, label: s.sections.signatures.title }]
      : []),
    ...(menu.pairings.length > 0
      ? [{ id: PAIRINGS_ID, label: s.sections.pairings.title }]
      : []),
    ...menu.categories.map((category) => ({
      id: categoryId(category),
      label: category.name?.[locale] ?? s.categories.uncategorized,
    })),
  ];

  return (
    <div dir={direction} className={STYLES.page}>
      <MenuHeader
        tabs={tabs}
        activeId={nav.activeId}
        direction={direction}
        onSelect={select}
        onSearch={actions.openSearch}
        onCategories={actions.openCategories}
        onToggleLanguage={() => setLocale(locale === "en" ? "ar" : "en")}
      />

      <main>
        <h1 className={STYLES.srOnly}>{s.page.title}</h1>

        {menu.signatures.length > 0 && (
          <SignaturesSection
            products={menu.signatures}
            onOpen={actions.openProduct}
          />
        )}

        {menu.pairings.length > 0 && (
          <PairingsSection
            pairings={menu.pairings}
            onOpen={actions.openPairing}
          />
        )}

        {menu.categories.map((category) => (
          <CategorySection
            key={categoryId(category)}
            category={category}
            onOpen={actions.openProduct}
          />
        ))}
      </main>

      <SearchOverlay
        menu={menu}
        isOpen={state.panel === "search"}
        onClose={actions.close}
        onPickSection={select}
        onOpenPairing={actions.openPairing}
        onOpenProduct={actions.openProduct}
      />

      <CategorySheet
        categories={menu.categories}
        activeId={nav.activeId}
        isOpen={state.panel === "categories"}
        onClose={actions.close}
        onPick={select}
      />

      {state.source && (
        <ItemSheet
          source={state.source}
          optionIds={state.optionIds}
          addOnIds={state.addOnIds}
          isOpen={state.panel === "item"}
          onClose={actions.close}
          onSelectSize={actions.selectSize}
          onSetBarista={actions.setBarista}
          onSetAddOns={actions.setAddOns}
          onOpenReference={(productId) => {
            const product = MenuLookup.product(menu, productId);
            if (product) actions.openProduct(product);
          }}
        />
      )}

      <PromoPopup popup={menu.popup} busy={state.panel !== "none"} />
    </div>
  );
}