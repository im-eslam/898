import { useLocale } from "@/shared/i18n";
import type { MenuPairingDto, MenuProductDto } from "@api/contracts";
import { Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { ProductImage } from "../../ui/product-image";

const STYLES = {
  hero: "flex flex-col gap-3",
  heroImage: "aspect-square w-full rounded-lg",
  heroBadge: "absolute end-2 top-2",
  description:
    "text-small font-medium text-pretty whitespace-pre-line text-navy/65",
  bundle: "flex flex-col items-start gap-3",
  bundlePictures: "flex w-full gap-2",
  bundlePicture: "aspect-square flex-1 rounded-lg",
} as const;

/** A product's large photo, its status, and its description, at the top of its sheet. */
export function ProductHero(props: { product: MenuProductDto }) {
  const locale = useLocale();
  const { product } = props;
  const available = Stock.isAvailable(product);
  const badge = Stock.badgeFor(product);
  const description = product.description[locale];

  return (
    <div className={STYLES.hero}>
      <div className="relative">
        <ProductImage
          image={product.image}
          kind="full"
          alt={product.name[locale]}
          grayscale={!available}
          className={STYLES.heroImage}
        />
        {badge && !available && (
          <span className={STYLES.heroBadge}>
            <Badge type={badge} />
          </span>
        )}
      </div>
      {badge && available && <Badge type={badge} />}
      {description && <p className={STYLES.description}>{description}</p>}
    </div>
  );
}

/** A bundle's items side by side, with the stock state or the savings badge. */
export function BundleHero(props: {
  pairing: MenuPairingDto;
  available: boolean;
}) {
  const locale = useLocale();
  const { pairing } = props;
  const hasSavings = pairing.pricing.discount > 0;

  return (
    <div className={STYLES.bundle}>
      <div className={STYLES.bundlePictures}>
        {pairing.items.map((item) => (
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
        <Badge type="savings" amount={pairing.pricing.discount} />
      )}
    </div>
  );
}
