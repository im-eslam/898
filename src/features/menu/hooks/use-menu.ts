import { useCallback, useMemo } from "react";
import type { MenuDto } from "@api/contracts";
import { sectionIds } from "../util/section";
import { useMenuNav } from "./use-menu-nav";
import { useMenuState } from "./use-menu-state";
import { useMenuTabs } from "./use-menu-tabs";

export function useMenu(menu: MenuDto) {
  const ids = useMemo(() => sectionIds(menu), [menu]);
  const nav = useMenuNav(ids);
  const panels = useMenuState();
  const tabs = useMenuTabs(menu);
  const close = panels.actions.close;
  const navSelect = nav.select;

  const select = useCallback(
    (sectionId: string) => {
      close();
      navSelect(sectionId);
    },
    [close, navSelect]
  );

  return {
    tabs,
    activeId: nav.activeId,
    select,
    panels,
  };
}
