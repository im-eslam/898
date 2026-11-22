import { Label, Radio, RadioGroup } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import type { MenuProductDto } from "@api/contracts";
import { strings } from "../../../strings";
import { MenuLookup } from "../../../util/menu";
import { Price } from "../../ui/price";

const STYLES = {
  group: "flex flex-col gap-2",
  label: "text-body font-bold",
  sizes: "grid auto-cols-fr grid-flow-col gap-2",
  size: "duration-base flex min-h-12 flex-col items-center justify-center rounded-full border border-sand/70 px-2 py-1 text-center transition-colors outline-none data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand data-hovered:bg-arctic/30 data-selected:border-brand data-selected:bg-brand data-selected:text-white motion-reduce:transition-none",
  sizeName: "text-small font-medium",
} as const;

interface ItemSizesProps {
  product: MenuProductDto;
  optionId: number | null;
  disabled: boolean;
  onSelect: (optionId: number) => void;
}

/** The size choice for a product that comes in several sizes. Renders nothing otherwise. */
export function ItemSizes(props: ItemSizesProps) {
  const s = useStrings(strings);
  const locale = useLocale();
  const { product } = props;

  if (product.pricing.type !== "multiple") return null;
  const sizes = product.pricing.options;
  if (sizes.length === 0) return null;

  const selected = MenuLookup.option(product, props.optionId);

  return (
    <RadioGroup
      value={selected ? String(selected.id) : ""}
      onChange={(value) => props.onSelect(Number(value))}
      orientation="horizontal"
      isDisabled={props.disabled}
      className={STYLES.group}
    >
      <Label className={STYLES.label}>{s.sheet.size}</Label>
      <div className={STYLES.sizes}>
        {sizes.map((size) => (
          <Radio key={size.id} value={String(size.id)} className={STYLES.size}>
            <span className={STYLES.sizeName}>{size.name?.[locale]}</span>
            <Price original={size.price} discounted={size.final} size="caption" />
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
