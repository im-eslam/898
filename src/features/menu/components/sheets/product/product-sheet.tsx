import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuPairingDto, MenuProductDto } from "@api/contracts";
import { MenuLookup, Pricing, Stock } from "../../../util/menu";
import { formatPrice } from "../../../util/price";
import { RollingNumber } from "../../ui/rolling-number";
import { BaseSheet } from "../base-sheet";
import { BundleHero } from "./bundle-hero";
import { BundleLineHeader } from "./bundle-line-header";
import { ProductAddons } from "./product-addons";
import { ProductHero } from "./product-hero";
import { ProductOftenOrdered } from "./product-often-ordered";
import { ProductOptions } from "./product-options";
import { strings } from "../../../strings";

interface ProductSheetProps {
  source: MenuProductDto | MenuPairingDto;
  optionIds: (number | null)[];
  addOnIds: number[][];
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (index: number, optionId: number) => void;
  onSetBarista: (index: number, on: boolean) => void;
  onSetAddOns: (index: number, ids: number[]) => void;
  onOpenReference: (productId: number) => void;
}

const STYLES = {
  content: "flex flex-col gap-6",
  line: "flex flex-col gap-4",
  total:
    "flex h-14 w-full items-center justify-center rounded-full bg-brand px-4 text-heading font-bold text-white tabular-nums",
  unavailable: "opacity-50",
} as const;

export function ProductSheet(props: ProductSheetProps) {
  const { sheet } = useStrings(strings);
  const locale = useLocale();

  const lines = MenuLookup.lines(props.source);
  const available = lines.every((line) => Stock.isAvailable(line));
  const total =
    "items" in props.source
      ? Pricing.pairing(props.source, props.optionIds, props.addOnIds)
      : Pricing.product(
          props.source,
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
      {sheet.items.outOfStock}
    </div>
  );

  return (
    <BaseSheet
      strings={{ title, description: sheet.items.description }}
      isOpen={props.isOpen}
      onClose={props.onClose}
      footer={footer}
    >
      <div className={STYLES.content}>
        {"items" in props.source ? (
          <BundleHero pairing={props.source} available={available} />
        ) : (
          <ProductHero product={props.source} />
        )}

        {lines.map((line, index) => (
          <section
            key={line.id}
            aria-label={line.name[locale]}
            className={STYLES.line}
          >
            {"items" in props.source && <BundleLineHeader product={line} />}
            <ProductOptions
              product={line}
              optionId={props.optionIds[index] ?? null}
              disabled={!available}
              onSelect={(optionId) => props.onSelectSize(index, optionId)}
            />
            <ProductAddons
              product={line}
              addOnIds={props.addOnIds[index] ?? []}
              disabled={!available}
              onBarista={(on) => props.onSetBarista(index, on)}
              onAddOns={(ids) => props.onSetAddOns(index, ids)}
            />
          </section>
        ))}

        {!("items" in props.source) &&
          props.source.oftenOrderedWith.length > 0 && (
            <ProductOftenOrdered
              references={props.source.oftenOrderedWith}
              onOpen={props.onOpenReference}
            />
          )}
      </div>
    </BaseSheet>
  );
}
