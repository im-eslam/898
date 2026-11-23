import { useLocale } from "@/shared/i18n";
import type { MenuPairingDto, MenuProductDto } from "@api/contracts";
import { Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { ProductImage } from "../../ui/product-image";

interface ItemHeroProps {
  source: MenuProductDto | MenuPairingDto;
  available: boolean;
}

interface ProductHeroProps {
  product: MenuProductDto;
}

interface BundleHeroProps {
  pairing: MenuPairingDto;
  available: boolean;
}

const STYLES = {
  product: {
    root: "flex w-full flex-col items-start gap-3",
    frame: "relative w-full",
    image: "aspect-square w-full rounded-lg",
    description:
      "text-small font-medium text-pretty whitespace-pre-line text-navy/65",
  },
  bundle: {
    root: "flex flex-col items-start gap-3",
    pictures: "flex w-full gap-2",
    picture: "aspect-square flex-1 rounded-lg",
  },
} as const;

export function ItemHero(props: ItemHeroProps) {
  return "items" in props.source ? (
    <BundleHero pairing={props.source} available={props.available} />
  ) : (
    <ProductHero product={props.source} />
  );
}

function ProductHero(props: ProductHeroProps) {
  const locale = useLocale();
  const available = Stock.isAvailable(props.product);
  const badge = Stock.badgeFor(props.product);
  const description = props.product.description[locale];

  return (
    <div className={STYLES.product.root}>
      <div className={STYLES.product.frame}>
        <ProductImage
          image={props.product.image}
          kind="full"
          alt={props.product.name[locale]}
          grayscale={!available}
          className={STYLES.product.image}
        />
      </div>
      {badge && <Badge type={badge} />}
      {description && (
        <p className={STYLES.product.description}>{description}</p>
      )}
    </div>
  );
}

function BundleHero(props: BundleHeroProps) {
  const locale = useLocale();
  const hasSavings = props.pairing.pricing.discount > 0;

  return (
    <div className={STYLES.bundle.root}>
      <div className={STYLES.bundle.pictures}>
        {props.pairing.items.map((item) => (
          <ProductImage
            key={item.id}
            image={item.image}
            kind="full"
            alt={item.name[locale]}
            grayscale={!Stock.isAvailable(item)}
            className={STYLES.bundle.picture}
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
