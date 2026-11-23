import { useLocale } from "@/shared/i18n";
import type { MenuProductDto } from "@api/contracts";
import { Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { ProductImage } from "../../ui/product-image";

interface BundleLineHeaderProps {
  product: MenuProductDto;
}

const STYLES = {
  lineHeader: "flex items-center gap-3",
  lineImage: "size-12 shrink-0 rounded-md",
  lineName: "min-w-0 flex-1 text-body font-semibold text-balance",
} as const;

export function BundleLineHeader(props: BundleLineHeaderProps) {
  const locale = useLocale();
  const badge = Stock.badgeFor(props.product);

  return (
    <div className={STYLES.lineHeader}>
      <ProductImage
        image={props.product.image}
        kind="thumb"
        grayscale={!Stock.isAvailable(props.product)}
        className={STYLES.lineImage}
      />
      <h3 className={STYLES.lineName}>{props.product.name[locale]}</h3>
      {badge && <Badge type={badge} compact />}
    </div>
  );
}
