import { useLocale } from "@/shared/i18n";
import type { MenuProductDto } from "@api/contracts";
import { Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { ProductImage } from "../../ui/product-image";

interface ProductHeroProps {
  product: MenuProductDto;
}

const STYLES = {
  hero: "flex flex-col gap-3",
  heroImage: "aspect-square w-full rounded-lg",
  heroBadge: "absolute end-2 top-2",
  description:
    "text-small font-medium text-pretty whitespace-pre-line text-navy/65",
} as const;

export function ProductHero(props: ProductHeroProps) {
  const locale = useLocale();
  const available = Stock.isAvailable(props.product);
  const badge = Stock.badgeFor(props.product);
  const description = props.product.description[locale];

  return (
    <div className={STYLES.hero}>
      <div className="relative">
        <ProductImage
          image={props.product.image}
          kind="full"
          alt={props.product.name[locale]}
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
