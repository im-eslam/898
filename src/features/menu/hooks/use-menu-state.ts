import { useMemo, useReducer } from "react";
import type { MenuPairingDto, MenuProductDto } from "@api/contracts";
import { MenuLookup, Selection } from "../util/menu";

export type MenuPanel = "none" | "search" | "categories" | "item";

export interface MenuState {
  panel: MenuPanel;
  /** The product or bundle the sheet shows. It stays set after close so the close animation has content. */
  source: MenuProductDto | MenuPairingDto | null;
  /** The chosen size for each line of source, by index. */
  optionIds: (number | null)[];
  /** The chosen add-ons for each line of source, by index. */
  addOnIds: number[][];
}

const initialMenuState: MenuState = {
  panel: "none",
  source: null,
  optionIds: [],
  addOnIds: [],
};

type MenuAction =
  | { type: "openSearch" }
  | { type: "openCategories" }
  | { type: "openItem"; source: MenuProductDto | MenuPairingDto }
  | { type: "close" }
  | { type: "selectSize"; index: number; optionId: number }
  | { type: "setBarista"; index: number; on: boolean }
  | { type: "setAddOns"; index: number; ids: number[] };

/** Returns a copy of the list with one entry replaced. */
function replaceAt<T>(list: readonly T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}

/** Every change to what the guest has opened and picked. Pure, so it is easy to test. */
export function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case "openSearch":
      return { ...state, panel: "search" };

    case "openCategories":
      return { ...state, panel: "categories" };

    case "openItem": {
      const lines = MenuLookup.lines(action.source);
      return {
        panel: "item",
        source: action.source,
        optionIds: lines.map((line) => MenuLookup.defaultOptionId(line)),
        addOnIds: lines.map((): number[] => []),
      };
    }

    case "close":
      return { ...state, panel: "none" };

    case "selectSize":
      return {
        ...state,
        optionIds: replaceAt(state.optionIds, action.index, action.optionId),
      };

    case "setBarista": {
      const line = state.source && MenuLookup.lines(state.source)[action.index];
      if (!line) return state;
      const ids = Selection.withBarista(
        state.addOnIds[action.index] ?? [],
        line.baristaWay.map((addOn) => addOn.id),
        action.on
      );
      return {
        ...state,
        addOnIds: replaceAt(state.addOnIds, action.index, ids),
      };
    }

    case "setAddOns": {
      const line = state.source && MenuLookup.lines(state.source)[action.index];
      if (!line) return state;
      const ids = Selection.withAddOns(
        state.addOnIds[action.index] ?? [],
        line.addOns.map((addOn) => addOn.id),
        action.ids
      );
      return {
        ...state,
        addOnIds: replaceAt(state.addOnIds, action.index, ids),
      };
    }
  }
}

/** The menu's open panel and the guest's picks, with the actions that change them. */
export function useMenuState() {
  const [state, dispatch] = useReducer(menuReducer, initialMenuState);

  const actions = useMemo(
    () => ({
      openSearch: () => dispatch({ type: "openSearch" }),
      openCategories: () => dispatch({ type: "openCategories" }),
      openProduct: (product: MenuProductDto) =>
        dispatch({ type: "openItem", source: product }),
      openPairing: (pairing: MenuPairingDto) =>
        dispatch({ type: "openItem", source: pairing }),
      close: () => dispatch({ type: "close" }),
      selectSize: (index: number, optionId: number) =>
        dispatch({ type: "selectSize", index, optionId }),
      setBarista: (index: number, on: boolean) =>
        dispatch({ type: "setBarista", index, on }),
      setAddOns: (index: number, ids: number[]) =>
        dispatch({ type: "setAddOns", index, ids }),
    }),
    []
  );

  return { state, actions };
}
