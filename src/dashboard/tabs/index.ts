import type { ComponentType } from "react";
import type { IconName } from "@/shared/icons";
import type { Localized } from "@/shared/i18n";
import { ReviewTab } from "./review";
import { strings as reviewStrings } from "./review/strings";
import { MenuTab } from "./menu";
import { strings as menuStrings } from "./menu/strings";
import { SettingsTab } from "./settings";
import { strings as settingsStrings } from "./settings/strings";

export interface TabDefinition {
  id: string;
  icon: IconName;
  strings: Localized<{ label: string }>;
  Component: ComponentType;
}

export const TABS: readonly TabDefinition[] = [
  { id: "review", icon: "star", strings: reviewStrings, Component: ReviewTab },
  { id: "menu", icon: "cup", strings: menuStrings, Component: MenuTab },
  {
    id: "settings",
    icon: "settings",
    strings: settingsStrings,
    Component: SettingsTab,
  },
];
