import {
  Checkbox,
  CheckboxGroup,
  Label,
  ToggleButton,
} from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type { MenuProductDto } from "@api/contracts";
import { fromKey, toKey } from "../../../util/keys";
import { Price } from "../../ui/price";
import { strings } from "../../../strings";

interface ProductAddonsProps {
  product: MenuProductDto;
  addOnIds: readonly number[];
  disabled: boolean;
  onBarista: (on: boolean) => void;
  onAddOns: (ids: number[]) => void;
}

const STYLES = {
  root: "flex flex-col gap-4",
  barista:
    "group duration-base flex min-h-14 w-full items-center gap-3 rounded-lg border-2 border-taupe bg-transparent px-4 py-2 text-start text-charcoal transition-[background-color,border-color,color] outline-none data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-hovered:bg-sand/20 data-selected:border-brand data-selected:bg-brand data-selected:text-white motion-reduce:transition-none",
  baristaIcon: "size-6 shrink-0",
  baristaText: "flex min-w-0 flex-1 flex-col",
  baristaTitle: "text-small font-bold",
  baristaSub:
    "text-caption font-medium text-taupe group-data-selected:text-white/80",
  checkbox:
    "duration-base flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-taupe/60 transition-colors group-data-selected:border-white/80 group-data-selected:bg-white group-data-selected:text-brand motion-reduce:transition-none",
  addOnsLabel: "pb-2 text-body font-bold",
  addOn:
    "group duration-base flex min-h-14 w-full items-center gap-4 border-b-[0.5px] border-sand/30 py-2 text-start transition-colors outline-none last:border-b-0 data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-brand data-hovered:bg-paper motion-reduce:transition-none",
  addOnBox:
    "duration-base flex size-6 shrink-0 items-center justify-center rounded-sm border-2 border-taupe/60 transition-colors group-data-selected:border-brand group-data-selected:bg-brand group-data-selected:text-white motion-reduce:transition-none",
  addOnName:
    "min-w-0 flex-1 text-body font-medium group-data-selected:font-semibold",
  tick: "size-4 scale-50 opacity-0 transition-[opacity,transform] duration-fast group-data-selected:scale-100 group-data-selected:opacity-100 motion-reduce:transition-none",
} as const;

export function ProductAddons(props: ProductAddonsProps) {
  const { sheet } = useStrings(strings);
  const locale = useLocale();

  const baristaIds = props.product.baristaWay.map((addOn) => addOn.id);
  const hasBarista = baristaIds.length > 0;
  const hasAddOns = props.product.addOns.length > 0;

  if (!hasBarista && !hasAddOns) return null;

  const baristaOn = baristaIds.every((id) => props.addOnIds.includes(id));

  return (
    <div className={STYLES.root}>
      {hasBarista && (
        <ToggleButton
          isSelected={baristaOn}
          onChange={props.onBarista}
          isDisabled={props.disabled}
          className={STYLES.barista}
        >
          <Icon name="sparkle" className={STYLES.baristaIcon} />
          <span className={STYLES.baristaText}>
            <span className={STYLES.baristaTitle}>
              {sheet.items.baristaWay}
            </span>
            <span className={STYLES.baristaSub}>{sheet.items.baristaSub}</span>
          </span>
          <span aria-hidden="true" className={STYLES.checkbox}>
            <Icon name="check" className={STYLES.tick} />
          </span>
        </ToggleButton>
      )}

      {hasAddOns && (
        <CheckboxGroup
          value={props.product.addOns
            .filter((addOn) => props.addOnIds.includes(addOn.id))
            .map((addOn) => toKey(addOn.id))}
          onChange={(values) => props.onAddOns(values.map(fromKey))}
          isDisabled={props.disabled}
        >
          <Label className={STYLES.addOnsLabel}>{sheet.items.addOns}</Label>
          {props.product.addOns.map((addOn) => (
            <Checkbox
              key={addOn.id}
              value={toKey(addOn.id)}
              className={STYLES.addOn}
            >
              <span aria-hidden="true" className={STYLES.addOnBox}>
                <Icon name="check" className={STYLES.tick} />
              </span>
              <span className={STYLES.addOnName}>{addOn.name[locale]}</span>
              <Price extra={addOn.price} />
            </Checkbox>
          ))}
        </CheckboxGroup>
      )}
    </div>
  );
}
