import { Button } from "react-aria-components";
import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { MenuPairingDto } from "@api/contracts";
import { Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { Chevron } from "../../ui/chevron";
import { Price } from "../../ui/price";
import { ProductImage } from "../../ui/product-image";
import { useTapGuard } from "../../ui/carousel";

interface PairingCardProps {
  pairing: MenuPairingDto;
  onOpen: () => void;
}

const STYLES = {
  root: "relative flex h-full touch-manipulation select-none [-webkit-user-select:none] [-webkit-touch-callout:none] flex-col gap-2 rounded-lg bg-white/70 p-2 ring-1 ring-sand/60",
  pictures: "relative flex aspect-2/1 w-full gap-1",
  picture: "min-w-0 flex-1 rounded-md",
  plus: "absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand text-white",
  plusIcon: "size-4",
  savings: "absolute end-2 top-2",
  names:
    "flex min-w-0 flex-col px-2 text-small font-semibold text-balance text-charcoal",
  footer: "mt-auto flex items-center gap-2 px-2 pt-1 pb-2",
  unavailable: "opacity-60",
  action:
    "absolute inset-0 z-10 rounded-lg outline-none select-none [-webkit-touch-callout:none] active:transform-none data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-brand",
} as const;

export function PairingCard(props: PairingCardProps) {
  const locale = useLocale();
  const allowPress = useTapGuard();

  const available = props.pairing.items.every((item) =>
    Stock.isAvailable(item)
  );
  const hasSavings = props.pairing.pricing.discount > 0;
  const name = props.pairing.items.map((item) => item.name[locale]).join(" + ");

  return (
    <div className={STYLES.root}>
      <div className={STYLES.pictures}>
        {props.pairing.items.map((item) => (
          <ProductImage
            key={item.id}
            image={item.image}
            kind="thumb"
            grayscale={!Stock.isAvailable(item)}
            className={STYLES.picture}
          />
        ))}

        {props.pairing.items.length > 1 && (
          <span aria-hidden="true" className={STYLES.plus}>
            <Icon name="plus" className={STYLES.plusIcon} />
          </span>
        )}

        {hasSavings && available && (
          <div className={STYLES.savings}>
            <Badge
              type="savings"
              amount={props.pairing.pricing.discount}
              compact
            />
          </div>
        )}
      </div>

      <div className={STYLES.names}>
        {props.pairing.items.map((item) => (
          <span key={item.id}>{item.name[locale]}</span>
        ))}
      </div>

      <div
        className={`${STYLES.footer} ${available ? "" : STYLES.unavailable}`}
      >
        <Price
          original={props.pairing.pricing.price}
          discounted={props.pairing.pricing.final}
        />
        <Chevron size="m" className="ms-auto" />
      </div>

      <Button
        aria-label={name}
        onPress={() => {
          if (allowPress()) props.onOpen();
        }}
        className={STYLES.action}
      />
    </div>
  );
}
