import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuPairingDto, MenuProductDto } from "@api/contracts";
import { strings } from "../../../strings";
import { MenuLookup, Pricing, Stock } from "../../../util/menu";
import { formatPrice } from "../../ui/price";
import { RollingNumber } from "../../ui/rolling-number";
import { ProductImage } from "../../ui/product-image";
import { Badge } from "../../ui/badge";
import { ItemAddons } from "./item-addons";
import { BundleHero, ProductHero } from "./item-parts";
import { ItemOftenOrdered } from "./item-often-ordered";
import { ItemSizes } from "./item-sizes";
import { MenuSheet } from "../../ui/menu-sheet";

interface ItemSheetProps {
  /** The product or bundle to show. */
  source: MenuProductDto | MenuPairingDto;
  optionIds: (number | null)[];
  addOnIds: number[][];
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (index: number, optionId: number) => void;
  onSetBarista: (index: number, on: boolean) => void;
  onSetAddOns: (index: number, ids: number[]) => void;
  /** Receives the id of a product from "often ordered with". */
  onOpenReference: (productId: number) => void;
}

const STYLES = {
  content: "flex flex-col gap-6",
  line: "flex flex-col gap-4",
  lineHeader: "flex items-center gap-3",
  lineImage: "size-12 shrink-0 rounded-md",
  lineName: "min-w-0 flex-1 text-body font-semibold text-balance",
  total:
    "flex h-14 w-full items-center justify-center rounded-full bg-brand px-4 text-heading font-bold text-white tabular-nums",
  unavailable: "opacity-50",
} as const;

/** The name, image and badge of one product inside a bundle's sheet. */
function BundleLineHeader(props: { product: MenuProductDto }) {
  const locale = useLocale();
  const { product } = props;
  const badge = Stock.badgeFor(product);

  return (
    <div className={STYLES.lineHeader}>
      <ProductImage
        image={product.image}
        kind="thumb"
        grayscale={!Stock.isAvailable(product)}
        className={STYLES.lineImage}
      />
      <h3 className={STYLES.lineName}>{product.name[locale]}</h3>
      {badge && <Badge type={badge} compact />}
    </div>
  );
}

/** The product or bundle sheet: the hero, each line's options, and the total. */
export function ItemSheet(props: ItemSheetProps) {
  const s = useStrings(strings);
  const locale = useLocale();
  const { source } = props;

  const lines = MenuLookup.lines(source);
  const available = lines.every((line) => Stock.isAvailable(line));
  const total =
    "items" in source
      ? Pricing.pairing(source, props.optionIds, props.addOnIds)
      : Pricing.product(
          source,
          props.optionIds[0] ?? null,
          props.addOnIds[0] ?? []
        );
  const title = lines.map((line) => line.name[locale]).join(" + ");

  const footer = available ? (
    <div className={STYLES.total} role="status" aria-live="polite">
      <RollingNumber text={formatPrice(total, locale)} />
    </div>
  ) : (
    <div className={`${STYLES.total} ${STYLES.unavailable}`}>
      {s.sheet.outOfStock}
    </div>
  );

  return (
    <MenuSheet
      strings={{
        title,
        description: s.sheet.itemDescription,
      }}
      isOpen={props.isOpen}
      onClose={props.onClose}
      footer={footer}
    >
      <div className={STYLES.content}>
        {"items" in source ? (
          <BundleHero pairing={source} available={available} />
        ) : (
          <ProductHero product={source} />
        )}

        {lines.map((line, index) => (
          <section
            key={line.id}
            aria-label={line.name[locale]}
            className={STYLES.line}
          >
            {"items" in source && <BundleLineHeader product={line} />}
            <ItemSizes
              product={line}
              optionId={props.optionIds[index] ?? null}
              disabled={!available}
              onSelect={(optionId) => props.onSelectSize(index, optionId)}
            />
            <ItemAddons
              product={line}
              addOnIds={props.addOnIds[index] ?? []}
              disabled={!available}
              onBarista={(on) => props.onSetBarista(index, on)}
              onAddOns={(ids) => props.onSetAddOns(index, ids)}
            />
          </section>
        ))}

        {!("items" in source) && source.oftenOrderedWith.length > 0 && (
          <ItemOftenOrdered
            references={source.oftenOrderedWith}
            onOpen={props.onOpenReference}
          />
        )}
      </div>
    </MenuSheet>
  );
}
