import { Button } from "react-aria-components";
import mark from "@/assets/mark.svg";
import { useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { Link, ROUTES } from "@/shared/router";
import { strings } from "../../strings";

interface TopBarProps {
  onSearch: () => void;
}

const STYLES = {
  bar: "flex h-14 min-w-0 flex-1 items-center gap-1 ps-4 md:ps-6",
  back: "-ms-3 flex size-12 shrink-0 items-center justify-center rounded-full text-charcoal transition-colors duration-fast ease-smooth [@media(hover:hover)_and_(pointer:fine)]:hover:bg-sand/40 active:bg-sand/60",
  backIcon: "size-5 rotate-180 rtl:rotate-0",
  mark: "h-7 w-auto",
  spacer: "flex-1",
  iconButton:
    "flex size-12 shrink-0 items-center justify-center rounded-full text-charcoal transition-colors duration-fast ease-smooth data-hovered:bg-sand/40 data-pressed:bg-sand/60",
  icon: "size-5",
} as const;

export function HeaderTopBar(props: TopBarProps) {
  const { header } = useStrings(strings);

  return (
    <div className={STYLES.bar}>
      <Link href={ROUTES.landing} aria-label={header.back} className={STYLES.back}>
        <Icon name="arrow" className={STYLES.backIcon} />
      </Link>

      <img
        src={mark}
        alt=""
        width={41}
        height={28}
        decoding="async"
        draggable={false}
        className={STYLES.mark}
      />

      <div className={STYLES.spacer} />

      <Button
        aria-label={header.search}
        onPress={props.onSearch}
        className={STYLES.iconButton}
      >
        <Icon name="search" className={STYLES.icon} />
      </Button>
    </div>
  );
}
