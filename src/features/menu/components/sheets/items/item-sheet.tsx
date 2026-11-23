import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuPairingDto, MenuProductDto } from "@api/contracts";
import { strings } from "../../../strings";
import { MenuLookup, Pricing, Stock } from "../../../util/menu";
import { formatPrice } from "../../../util/price";
import { RollingNumber } from "../../ui/rolling-number";
import { BaseSheet } from "../base-sheet";
import { ItemHero } from "./item-hero";
import { ItemLine } from "./item-line";
import { ItemOftenOrdered } from "./item-often-ordered";

export interface ItemSheetProps {
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
  total:
    "flex h-14 w-full items-center justify-center rounded-full bg-brand px-4 text-heading font-bold text-white tabular-nums",
  unavailable: "opacity-50",
} as const;

export function ItemSheet(props: ItemSheetProps) {
  const { badges, itemSheet } = useStrings(strings);
  const locale = useLocale();

  const isBundle = "items" in props.source;
  const lines = MenuLookup.lines(props.source);
  const available = lines.every((line) => Stock.isAvailable(line));
  const title = lines.map((line) => line.name[locale]).join(" + ");
  const oftenOrdered = "items" in props.source ? [] : props.source.oftenOrderedWith;
  const total =
    "items" in props.source
      ? Pricing.pairing(props.source, props.optionIds, props.addOnIds)
      : Pricing.product(
          props.source,
          props.optionIds[0] ?? null,
          props.addOnIds[0] ?? []
        );
  const sourceKey = `${isBundle ? "pairing" : "product"}-${props.source.id}`;

  const footer = available ? (
    <div className={STYLES.total} role="status" aria-live="polite">
      <RollingNumber text={formatPrice(total, locale)} />
    </div>
  ) : (
    <div className={`${STYLES.total} ${STYLES.unavailable}`}>
      {badges.outOfStock}
    </div>
  );

  return (
    <BaseSheet
      variant="topBar"
      title={title}
      description={itemSheet.description}
      isOpen={props.isOpen}
      resetKey={sourceKey}
      onClose={props.onClose}
      footer={footer}
    >
      <ItemHero source={props.source} available={available} />

      {lines.map((line, index) => (
        <ItemLine
          key={line.id}
          product={line}
          showHeader={isBundle}
          optionId={props.optionIds[index] ?? null}
          addOnIds={props.addOnIds[index] ?? []}
          disabled={!available}
          onSelectSize={(optionId) => props.onSelectSize(index, optionId)}
          onBarista={(on) => props.onSetBarista(index, on)}
          onAddOns={(ids) => props.onSetAddOns(index, ids)}
        />
      ))}

      {oftenOrdered.length > 0 && (
        <ItemOftenOrdered
          references={oftenOrdered}
          onOpen={props.onOpenReference}
        />
      )}
    </BaseSheet>
  );
}
