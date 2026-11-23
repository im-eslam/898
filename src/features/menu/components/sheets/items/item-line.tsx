import {
  Checkbox,
  CheckboxGroup,
  Label,
  Radio,
  RadioGroup,
  ToggleButton,
} from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { MenuProductDto } from "@api/contracts";
import { strings } from "../../../strings";
import { MenuLookup, Stock } from "../../../util/menu";
import { Badge } from "../../ui/badge";
import { Price } from "../../ui/price";
import { ProductImage } from "../../ui/product-image";

interface ItemLineProps {
  product: MenuProductDto;
  showHeader: boolean;
  optionId: number | null;
  addOnIds: readonly number[];
  disabled: boolean;
  onSelectSize: (optionId: number) => void;
  onBarista: (on: boolean) => void;
  onAddOns: (ids: number[]) => void;
}

interface LineHeaderProps {
  product: MenuProductDto;
}

interface SizePickerProps {
  product: MenuProductDto;
  optionId: number | null;
  disabled: boolean;
  onSelect: (optionId: number) => void;
}

interface AddOnsProps {
  product: MenuProductDto;
  addOnIds: readonly number[];
  disabled: boolean;
  onBarista: (on: boolean) => void;
  onAddOns: (ids: number[]) => void;
}

const STYLES = {
  line: "flex flex-col gap-4",
  header: {
    root: "flex items-center gap-3",
    image: "size-12 shrink-0 rounded-md",
    name: "min-w-0 flex-1 text-body font-semibold text-balance",
  },
  sizes: {
    group: "flex flex-col gap-2",
    label: "text-body font-bold",
    options: "grid auto-cols-fr grid-flow-col gap-2",
    option:
      "duration-base flex min-h-12 flex-col items-center justify-center rounded-full border border-sand/70 px-2 py-1 text-center transition-colors outline-none data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-hovered:bg-arctic/30 data-selected:border-brand data-selected:bg-brand data-selected:text-white",
    name: "text-small font-medium",
  },
  addOns: {
    root: "flex flex-col gap-4",
    barista:
      "group duration-base flex min-h-14 w-full items-center gap-3 rounded-lg border-2 border-taupe bg-transparent px-4 py-2 text-start text-charcoal transition-[background-color,border-color,color] outline-none data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-hovered:bg-sand/20 data-selected:border-brand data-selected:bg-brand data-selected:text-white",
    baristaIcon: "size-6 shrink-0",
    baristaText: "flex min-w-0 flex-1 flex-col",
    baristaTitle: "text-small font-bold",
    baristaSub:
      "text-caption font-medium text-taupe group-data-selected:text-white/80",
    baristaBox:
      "duration-base flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-taupe/60 transition-colors group-data-selected:border-white/80 group-data-selected:bg-white group-data-selected:text-brand",
    label: "pb-2 text-body font-bold",
    row: "group duration-base flex min-h-14 w-full items-center gap-4 border-b-[0.5px] border-sand/30 py-2 text-start transition-colors outline-none last:border-b-0 data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-brand data-hovered:bg-paper",
    box: "duration-base flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-taupe/60 transition-colors group-data-selected:border-brand group-data-selected:bg-brand group-data-selected:text-white",
    name: "min-w-0 flex-1 text-body font-medium group-data-selected:font-semibold",
    tick: "size-4 scale-50 opacity-0 transition-[opacity,transform] duration-fast group-data-selected:scale-100 group-data-selected:opacity-100",
  },
} as const;

export function ItemLine(props: ItemLineProps) {
  const locale = useLocale();

  return (
    <section aria-label={props.product.name[locale]} className={STYLES.line}>
      {props.showHeader && <LineHeader product={props.product} />}
      <SizePicker
        product={props.product}
        optionId={props.optionId}
        disabled={props.disabled}
        onSelect={props.onSelectSize}
      />
      <AddOns
        product={props.product}
        addOnIds={props.addOnIds}
        disabled={props.disabled}
        onBarista={props.onBarista}
        onAddOns={props.onAddOns}
      />
    </section>
  );
}

function LineHeader(props: LineHeaderProps) {
  const locale = useLocale();
  const badge = Stock.badgeFor(props.product);

  return (
    <div className={STYLES.header.root}>
      <ProductImage
        image={props.product.image}
        kind="thumb"
        grayscale={!Stock.isAvailable(props.product)}
        className={STYLES.header.image}
      />
      <h3 className={STYLES.header.name}>{props.product.name[locale]}</h3>
      {badge && <Badge type={badge} compact />}
    </div>
  );
}

function SizePicker(props: SizePickerProps) {
  const { itemSheet } = useStrings(strings);
  const locale = useLocale();

  if (props.product.pricing.type !== "multiple") return null;
  const sizes = props.product.pricing.options;
  if (sizes.length === 0) return null;

  const selected = MenuLookup.option(props.product, props.optionId);

  return (
    <RadioGroup
      value={selected ? String(selected.id) : ""}
      onChange={(key) => props.onSelect(Number(key))}
      orientation="horizontal"
      isDisabled={props.disabled}
      className={STYLES.sizes.group}
    >
      <Label className={STYLES.sizes.label}>{itemSheet.size}</Label>
      <div className={STYLES.sizes.options}>
        {sizes.map((size) => (
          <Radio
            key={size.id}
            value={String(size.id)}
            className={STYLES.sizes.option}
          >
            <span className={STYLES.sizes.name}>{size.name?.[locale]}</span>
            <Price
              original={size.price}
              discounted={size.final}
              size="caption"
            />
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}

function AddOns(props: AddOnsProps) {
  const { itemSheet } = useStrings(strings);
  const locale = useLocale();

  const baristaIds = props.product.baristaWay.map((addOn) => addOn.id);
  const hasBarista = baristaIds.length > 0;
  const selectableAddOns = [
    ...props.product.addOns,
    ...props.product.baristaWay,
  ].filter(
    (addOn, index, list) =>
      list.findIndex((candidate) => candidate.id === addOn.id) === index
  );
  const hasAddOns = selectableAddOns.length > 0;

  if (!hasBarista && !hasAddOns) return null;

  const baristaOn = baristaIds.every((id) => props.addOnIds.includes(id));

  return (
    <div className={STYLES.addOns.root}>
      {hasBarista && (
        <ToggleButton
          isSelected={baristaOn}
          onChange={props.onBarista}
          isDisabled={props.disabled}
          className={STYLES.addOns.barista}
        >
          <Icon name="sparkle" className={STYLES.addOns.baristaIcon} />
          <span className={STYLES.addOns.baristaText}>
            <span className={STYLES.addOns.baristaTitle}>
              {itemSheet.baristaWay}
            </span>
            <span className={STYLES.addOns.baristaSub}>
              {itemSheet.baristaSub}
            </span>
          </span>
          <span aria-hidden="true" className={STYLES.addOns.baristaBox}>
            <Icon name="check" className={STYLES.addOns.tick} />
          </span>
        </ToggleButton>
      )}

      {hasAddOns && (
        <CheckboxGroup
          value={selectableAddOns
            .filter((addOn) => props.addOnIds.includes(addOn.id))
            .map((addOn) => String(addOn.id))}
          onChange={(values) => props.onAddOns(values.map((v) => Number(v)))}
          isDisabled={props.disabled}
        >
          <Label className={STYLES.addOns.label}>{itemSheet.addOns}</Label>
          {selectableAddOns.map((addOn) => (
            <Checkbox
              key={addOn.id}
              value={String(addOn.id)}
              className={STYLES.addOns.row}
            >
              <span aria-hidden="true" className={STYLES.addOns.box}>
                <Icon name="check" className={STYLES.addOns.tick} />
              </span>
              <span className={STYLES.addOns.name}>{addOn.name[locale]}</span>
              <Price extra={addOn.price} />
            </Checkbox>
          ))}
        </CheckboxGroup>
      )}
    </div>
  );
}
