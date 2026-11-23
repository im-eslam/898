import type { MenuProductDto } from "@api/contracts";
import { SIGNATURES_ID } from "../../../util/section";
import { Carousel } from "../../ui/carousel";
import { SectionHeading } from "../../ui/section-heading";
import { SignatureCard } from "./signature-card";

interface SignaturesSectionProps {
  products: MenuProductDto[];
  onOpen: (product: MenuProductDto) => void;
}

const STYLES = {
  section:
    "scroll-mt-[calc(7rem+env(safe-area-inset-top,0px))] rounded-b-sheet bg-navy py-6",
  inner: "mx-auto flex w-full max-w-5xl flex-col gap-4",
  head: "px-4 md:px-6",
  carousel: "px-4 md:px-6",
  item: "w-[75%] sm:w-[45%] lg:w-[30%]",
} as const;

export function SignaturesSection(props: SignaturesSectionProps) {
  const titleId = `${SIGNATURES_ID}-title`;

  return (
    <section
      id={SIGNATURES_ID}
      aria-labelledby={titleId}
      className={STYLES.section}
    >
      <div className={STYLES.inner}>
        <div className={STYLES.head}>
          <SectionHeading id={titleId} section="signatures" light />
        </div>

        <Carousel
          key={props.products.map((p) => p.id).join("-")}
          labelledBy={titleId}
          tone="light"
          itemClassName={STYLES.item}
          className={STYLES.carousel}
        >
          {props.products.map((product, index) => (
            <SignatureCard
              key={product.id}
              product={product}
              priority={index === 0 || index === 1}
              onOpen={() => props.onOpen(product)}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
