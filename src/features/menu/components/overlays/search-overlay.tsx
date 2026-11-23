import { useDeferredValue, useMemo, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuDto, MenuPairingDto, MenuProductDto } from "@api/contracts";
import { strings } from "../../strings";
import { matchMenu } from "../../util/search";
import { SearchBar } from "./search-bar";
import { SearchItems } from "./search-items";

interface SearchOverlayProps {
  menu: MenuDto;
  isOpen: boolean;
  onClose: () => void;
  onPickSection: (sectionId: string) => void;
  onOpenPairing: (pairing: MenuPairingDto) => void;
  onOpenProduct: (product: MenuProductDto) => void;
}

interface SearchPanelProps {
  menu: MenuDto;
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

function useMenuSearch(menu: MenuDto) {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const data = useMemo(
    () => matchMenu(menu, deferredQuery, locale),
    [menu, deferredQuery, locale]
  );

  return { query, setQuery, deferredQuery, data };
}

function SearchPanel(props: SearchPanelProps) {
  const { search: searchStrings } = useStrings(strings);
  const search = useMenuSearch(props.menu);
  const hasQuery = search.query.trim() !== "";
  const total = search.data.total;

  return (
    <>
      <SearchBar
        query={search.query}
        onChange={search.setQuery}
        onClose={props.onClose}
      />

      <p aria-live="polite" className={STYLES.status}>
        {hasQuery ? searchStrings.itemsCount(total) : ""}
      </p>

      <SearchItems
        query={search.query}
        deferredQuery={search.deferredQuery}
        total={total}
        categories={search.data.categories}
        pairings={search.data.pairings}
        products={search.data.products}
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
