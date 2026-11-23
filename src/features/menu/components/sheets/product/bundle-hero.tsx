import { useLocale } from "@/shared/i18n";
import type { MenuPairingDto } from "@api/contracts";
import { Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { ProductImage } from "../../ui/product-image";

interface BundleHeroProps {
  pairing: MenuPairingDto;
  available: boolean;
}

const STYLES = {
  bundle: "flex flex-col items-start gap-3",
  bundlePictures: "flex w-full gap-2",
  bundlePicture: "aspect-square flex-1 rounded-lg",
} as const;

export function BundleHero(props: BundleHeroProps) {
  const locale = useLocale();
  const hasSavings = props.pairing.pricing.discount > 0;

  return (
    <div className={STYLES.bundle}>
      <div className={STYLES.bundlePictures}>
        {props.pairing.items.map((item) => (
          <ProductImage
            key={item.id}
            image={item.image}
            kind="full"
            alt={item.name[locale]}
            grayscale={!Stock.isAvailable(item)}
            className={STYLES.bundlePicture}
          />
        ))}
      </div>
      {!props.available && <Badge type="outOfStock" />}
      {props.available && hasSavings && (
        <Badge type="savings" amount={props.pairing.pricing.discount} />
      )}
    </div>
  );
}
