import type { ReactNode } from "react";
import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import type {
  MenuCategoryDto,
  MenuPairingDto,
  MenuProductDto,
} from "@api/contracts";
import { strings } from "../../strings";
import { MenuLookup, Stock } from "../../util/menu";
import { categoryId } from "../../util/section";
import { Badge } from "../ui/badge";
import { Price } from "../ui/price";
import { ProductImage } from "../ui/product-image";

const STYLES = {
  results: "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6",
  message: {
    root: "flex flex-col items-center gap-3 px-6 py-12 text-center text-small font-medium text-pretty text-navy/65",
    icon: "size-8",
  },
  group: {
    heading: "px-4 py-2 text-caption font-semibold text-navy/65",
  },
  row: {
    wrap: "border-b-[0.5px] border-sand/30",
    base: "flex w-full items-center gap-3 px-4 text-start outline-none data-hovered:bg-paper data-pressed:bg-arctic/40 data-focus-visible:-outline-offset-2 data-focus-visible:outline-2 data-focus-visible:outline-brand",
    compact: "min-h-12",
    rich: "min-h-18 py-2",
  },
  category: {
    name: "min-w-0 flex-1 text-body font-medium text-balance",
    count: "shrink-0 text-caption font-medium tabular-nums text-navy/65",
  },
  pairing: {
    thumbs: "flex shrink-0 gap-1",
    thumb: "size-8 rounded-md",
    name: "min-w-0 flex-1 text-body font-medium text-balance",
  },
  product: {
    thumb: "size-12 shrink-0 rounded-md",
    text: "flex min-w-0 flex-1 flex-col items-start",
    name: "text-body font-medium text-balance",
    description: "line-clamp-1 text-caption font-medium text-navy/65",
  },
  unavailable: "opacity-60",
} as const;

interface SearchResultsProps {
  query: string;
  deferredQuery: string;
  total: number | undefined;
  categories: MenuCategoryDto[];
  pairings: MenuPairingDto[];
  products: MenuProductDto[];
  onPickSection: (sectionId: string) => void;
  onOpenPairing: (pairing: MenuPairingDto) => void;
  onOpenProduct: (product: MenuProductDto) => void;
}

function ResultGroup(props: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className={STYLES.group.heading}>{props.title}</h2>
      {props.children}
    </section>
  );
}

function ResultRow(props: {
  variant: "compact" | "rich";
  onPress: () => void;
  children: ReactNode;
}) {
  const size =
    props.variant === "compact" ? STYLES.row.compact : STYLES.row.rich;

  return (
    <div className={STYLES.row.wrap}>
      <Button onPress={props.onPress} className={`${STYLES.row.base} ${size}`}>
        {props.children}
      </Button>
    </div>
  );
}

function CategoryRow(props: {
  category: MenuCategoryDto;
  onPress: () => void;
}) {
  const s = useStrings(strings);
  const locale = useLocale();

  return (
    <ResultRow variant="compact" onPress={props.onPress}>
      <span className={STYLES.category.name}>
        {props.category.name?.[locale] ?? s.categories.uncategorized}
      </span>
      <span className={STYLES.category.count}>
        {props.category.products.length}
      </span>
    </ResultRow>
  );
}

function PairingRow(props: { pairing: MenuPairingDto; onPress: () => void }) {
  const locale = useLocale();
  const available = props.pairing.items.every((item) =>
    Stock.isAvailable(item)
  );

  return (
    <ResultRow variant="rich" onPress={props.onPress}>
      <span className={STYLES.pairing.thumbs}>
        {props.pairing.items.map((item) => (
          <ProductImage
            key={item.id}
            image={item.image}
            kind="thumb"
            grayscale={!Stock.isAvailable(item)}
            className={STYLES.pairing.thumb}
          />
        ))}
      </span>
      <span className={STYLES.pairing.name}>
        {props.pairing.items.map((item) => item.name[locale]).join(" + ")}
      </span>
      <span className={available ? "" : STYLES.unavailable}>
        <Price
          original={props.pairing.pricing.price}
          discounted={props.pairing.pricing.final}
        />
      </span>
    </ResultRow>
  );
}

function ProductRow(props: { product: MenuProductDto; onPress: () => void }) {
  const locale = useLocale();
  const available = Stock.isAvailable(props.product);
  const option = MenuLookup.startingOption(props.product);
  const description = props.product.description[locale];

  return (
    <ResultRow variant="rich" onPress={props.onPress}>
      <ProductImage
        image={props.product.image}
        kind="thumb"
        grayscale={!available}
        className={STYLES.product.thumb}
      />
      <span className={STYLES.product.text}>
        <span className={STYLES.product.name}>
          {props.product.name[locale]}
        </span>
        {description && (
          <span className={STYLES.product.description}>{description}</span>
        )}
        {!available && <Badge type="outOfStock" compact />}
      </span>
      {option && (
        <span className={available ? "" : STYLES.unavailable}>
          <Price
            original={option.price}
            discounted={option.final}
            from={MenuLookup.isMultiSize(props.product)}
          />
        </span>
      )}
    </ResultRow>
  );
}

export function SearchResults(props: SearchResultsProps) {
  const { search } = useStrings(strings);

  const message =
    props.query.trim() === ""
      ? search.prompt
      : props.total === 0
        ? search.noMatch(props.deferredQuery.trim())
        : null;

  return (
    <div className={STYLES.results}>
      {message && (
        <div className={STYLES.message.root}>
          <Icon name="search" className={STYLES.message.icon} />
          <p>{message}</p>
        </div>
      )}

      {props.categories.length > 0 && (
        <ResultGroup title={search.groupCategories}>
          {props.categories.map((category) => (
            <CategoryRow
              key={categoryId(category)}
              category={category}
              onPress={() => props.onPickSection(categoryId(category))}
            />
          ))}
        </ResultGroup>
      )}

      {props.pairings.length > 0 && (
        <ResultGroup title={search.groupOffers}>
          {props.pairings.map((pairing) => (
            <PairingRow
              key={pairing.id}
              pairing={pairing}
              onPress={() => props.onOpenPairing(pairing)}
            />
          ))}
        </ResultGroup>
      )}

      {props.products.length > 0 && (
        <ResultGroup title={search.groupItems}>
          {props.products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onPress={() => props.onOpenProduct(product)}
            />
          ))}
        </ResultGroup>
      )}
    </div>
  );
}
