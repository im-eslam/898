import { useDeferredValue, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocale, useStrings, type Locale } from "@/shared/i18n";
import type { MenuDto, MenuPairingDto, MenuProductDto } from "@api/contracts";
import { strings } from "../../../strings";
import { SearchBar } from "./search-bar";
import { SearchResults } from "./search-result";

interface SearchOverlayProps {
  menu: MenuDto;
  isOpen: boolean;
  onClose: () => void;
  onPickSection: (sectionId: string) => void;
  onOpenPairing: (pairing: MenuPairingDto) => void;
  onOpenProduct: (product: MenuProductDto) => void;
}

const STYLES = {
  overlay:
    "fixed inset-0 z-50 flex justify-center overscroll-none md:items-start md:p-6 md:pt-[8dvh] data-entering:animate-fade-in data-exiting:animate-fade-out motion-reduce:animate-none",
  scrim: "pointer-events-none absolute inset-0 bg-scrim",
  modal:
    "relative z-10 flex h-full w-full max-w-120 flex-col overflow-hidden bg-white outline-none data-entering:animate-fade-in data-exiting:animate-fade-out motion-reduce:animate-none md:h-[min(40rem,80dvh)] md:max-w-140 md:rounded-lg md:shadow-sheet",
  dialog: "flex min-h-0 flex-1 flex-col outline-none",
  status: "sr-only",
} as const;

function normalize(value: string, locale: Locale): string {
  return value
    .toLocaleLowerCase(locale)
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchMenu(menu: MenuDto, query: string, locale: Locale) {
  const needle = normalize(query, locale);
  const matches = (fields: (string | undefined)[]) =>
    needle !== "" &&
    fields.some(
      (field) =>
        field !== undefined && normalize(field, locale).includes(needle)
    );

  const categories = menu.categories.filter((category) =>
    matches([category.name?.[locale]])
  );

  const pairings = menu.pairings.filter((pairing) =>
    matches(pairing.items.map((item) => item.name[locale]))
  );

  const products = menu.categories
    .flatMap((category) => category.products)
    .filter((product) =>
      matches([product.name[locale], product.description[locale]])
    );

  return {
    categories,
    pairings,
    products,
    total: categories.length + pairings.length + products.length,
  };
}

function useMenuSearch(menu: MenuDto) {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const search = useQuery({
    queryKey: ["menu-search", menu.updatedAt, locale, deferredQuery.trim()],
    queryFn: () => matchMenu(menu, deferredQuery, locale),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

  return { query, setQuery, deferredQuery, data: search.data };
}

type SearchPanelProps = Omit<SearchOverlayProps, "isOpen">;

function SearchPanel(props: SearchPanelProps) {
  const { search: searchS } = useStrings(strings);

  const search = useMenuSearch(props.menu);
  const hasQuery = search.query.trim() !== "";
  const total = search.data?.total;

  return (
    <>
      <SearchBar
        query={search.query}
        onChange={search.setQuery}
        onClose={props.onClose}
      />

      <p aria-live="polite" className={STYLES.status}>
        {hasQuery && total !== undefined ? searchS.itemsCount(total) : ""}
      </p>

      <SearchResults
        query={search.query}
        deferredQuery={search.deferredQuery}
        total={total}
        categories={search.data?.categories ?? []}
        pairings={search.data?.pairings ?? []}
        products={search.data?.products ?? []}
        onPickSection={props.onPickSection}
        onOpenPairing={props.onOpenPairing}
        onOpenProduct={props.onOpenProduct}
      />
    </>
  );
}

export function SearchOverlay(props: SearchOverlayProps) {
  const { search } = useStrings(strings);

  return (
    <ModalOverlay
      isOpen={props.isOpen}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
      isDismissable
      className={STYLES.overlay}
    >
      <div aria-hidden="true" className={STYLES.scrim} />
      <Modal className={STYLES.modal}>
        <Dialog aria-label={search.label} className={STYLES.dialog}>
          <SearchPanel
            menu={props.menu}
            onClose={props.onClose}
            onPickSection={props.onPickSection}
            onOpenPairing={props.onOpenPairing}
            onOpenProduct={props.onOpenProduct}
          />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
