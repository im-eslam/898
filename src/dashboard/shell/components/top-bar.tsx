import { Button } from "react-aria-components";
import logo from "@/assets/mark.svg";
import { Icon } from "@/shared/icons";

interface ShellTopBarProps {
  brand: string;
  signOutLabel: string;
  isSigningOut: boolean;
  onSignOut: () => void;
}

const STYLES = {
  bar: "sticky top-0 z-30 flex items-center gap-3 bg-cream/90 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 backdrop-blur md:static md:bg-transparent md:px-10 md:pt-4 md:pb-0 md:backdrop-blur-none",
  brand: "flex items-center gap-3 md:hidden",
  logo: "h-auto w-8",
  brandName: "text-small font-bold text-navy",
  signOut:
    "ms-auto inline-flex h-11 items-center gap-2 rounded-full border border-navy/15 bg-paper px-4 text-small font-bold text-navy outline-none transition-colors ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [@media(hover:hover)_and_(pointer:fine)]:hover:bg-cream data-disabled:opacity-50 md:hidden",
} as const;

export function ShellTopBar(props: ShellTopBarProps) {
  return (
    <header className={STYLES.bar}>
      <div className={STYLES.brand}>
        <img src={logo} alt="" className={STYLES.logo} />
        <span className={STYLES.brandName}>{props.brand}</span>
      </div>

      <Button
        onPress={props.onSignOut}
        isDisabled={props.isSigningOut}
        className={STYLES.signOut}
      >
        <Icon name="exit" size={18} />
        <span>{props.signOutLabel}</span>
      </Button>
    </header>
  );
}
