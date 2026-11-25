import { createContext, useContext } from "react";

// On phones the dialog is a sheet that traps focus. Dropdowns must open inside it,
// not on the page behind, so the sheet publishes its element here.
export const SheetContainerContext = createContext<HTMLElement | null>(null);

export function useSheetContainer(): HTMLElement | null {
  return useContext(SheetContainerContext);
}
