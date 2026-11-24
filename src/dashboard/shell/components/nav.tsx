import { Button } from "react-aria-components";
import { Icon, type IconName } from "@/shared/icons";

export interface NavItem {
  id: string;
  icon: IconName;
  label: string;
}

interface ShellNavProps {
  items: readonly NavItem[];
  activeId: string;
  ariaLabel: string;
  onSelect: (id: string) => void;
  signOutLabel: string;
  isSigningOut: boolean;
  onSignOut: () => void;
}

const STYLES = {
  nav: "flex w-full items-center justify-around gap-1 md:flex-1 md:flex-col md:items-stretch md:justify-start",
  item: "flex h-12 w-12 shrink-0 items-center justify-center gap-3 rounded-full text-navy outline-none transition-colors ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [@media(hover:hover)_and_(pointer:fine)]:hover:bg-cream md:h-11 md:w-full md:justify-start md:rounded-lg md:px-4 md:text-small md:font-bold",
  active: "bg-arctic text-brand",
  label: "sr-only md:not-sr-only",
  footer: "hidden md:mt-auto md:block",
  signOut: "flex h-11 w-full items-center gap-3 rounded-lg px-4 text-small font-bold text-navy outline-none transition-colors ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [@media(hover:hover)_and_(pointer:fine)]:hover:bg-cream data-disabled:opacity-50",
} as const;

export function ShellNav(props: ShellNavProps) {
  return (
    <nav aria-label={props.ariaLabel} className={STYLES.nav}>
      {props.items.map((item) => {
        const isActive = item.id === props.activeId;

        return (
          <Button
            key={item.id}
            onPress={() => props.onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`${STYLES.item} ${isActive ? STYLES.active : ""}`}
          >
            <Icon name={item.icon} size={20} />
            <span className={STYLES.label}>{item.label}</span>
          </Button>
        );
      })}
      <div className={STYLES.footer}>
        <Button
          onPress={props.onSignOut}
          isDisabled={props.isSigningOut}
          className={STYLES.signOut}
        >
          <Icon name="exit" size={20} />
          <span>{props.signOutLabel}</span>
        </Button>
      </div>
    </nav>
  );
}
