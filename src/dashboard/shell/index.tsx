import { useState } from "react";
import { Toaster } from "react-hot-toast";
import logo from "@/assets/mark.svg";
import { useLocale, useStrings } from "@/shared/i18n";
import { useSignOut } from "../hooks/use-sign-out";
import { TABS } from "../tabs";
import { ShellNav, type NavItem } from "./components/nav";
import { ShellTopBar } from "./components/top-bar";
import { strings } from "./strings";

const STYLES = {
  root: "flex min-h-dvh flex-col bg-cream text-charcoal md:flex-row md:items-start",
  aside:
    "fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm rounded-full border border-sand/60 bg-paper p-1.5 md:sticky md:top-3 md:inset-auto md:m-3 md:h-[calc(100dvh-1.5rem)] md:w-64 md:max-w-none md:shrink-0 md:flex-col md:self-start md:rounded-lg md:p-4",
  brand: "hidden items-center gap-3 px-2 pt-1 pb-4 md:flex",
  logo: "h-auto w-10",
  brandName: "text-heading font-bold text-navy",
  column: "flex min-w-0 flex-1 flex-col",
  content: "min-w-0 flex-1 px-5 pt-6 pb-32 md:px-10 md:pt-4 md:pb-12",
} as const;

export function DashboardShell() {
  const s = useStrings(strings);
  const locale = useLocale();

  const [activeId, setActiveId] = useState<string>(TABS[0]!.id);
  const { signOut, isPending: isSigningOut } = useSignOut();

  const navItems: NavItem[] = TABS.map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: tab.strings[locale].label,
  }));
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0]!;
  const { Component } = active;

  return (
    <div className={STYLES.root}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <aside className={STYLES.aside}>
        <div className={STYLES.brand}>
          <img src={logo} alt="" className={STYLES.logo} />
          <span className={STYLES.brandName}>{s.brand}</span>
        </div>
        <ShellNav
          items={navItems}
          activeId={active.id}
          ariaLabel={s.navLabel}
          onSelect={setActiveId}
          signOutLabel={s.signOut}
          isSigningOut={isSigningOut}
          onSignOut={signOut}
        />
      </aside>

      <div className={STYLES.column}>
        <ShellTopBar
          brand={s.brand}
          signOutLabel={s.signOut}
          isSigningOut={isSigningOut}
          onSignOut={signOut}
        />
        <main className={STYLES.content}>
          <Component />
        </main>
      </div>
    </div>
  );
}
