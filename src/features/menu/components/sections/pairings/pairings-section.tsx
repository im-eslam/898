import type { MenuPairingDto } from "@api/contracts";
import { PAIRINGS_ID } from "../../../util/section";
import { Carousel } from "../../ui/carousel";
import { SectionHeading } from "../../ui/section-heading";
import { PairingCard } from "./pairing-card";

interface PairingsSectionProps {
  pairings: MenuPairingDto[];
  onOpen: (pairing: MenuPairingDto) => void;
}

const STYLES = {
  section: "scroll-mt-28 pt-6 pb-5",
  inner: "mx-auto flex w-full max-w-5xl flex-col gap-4",
  head: "px-4 md:px-6",
  carousel: "px-4 md:px-6",
  slide: "w-64 sm:w-80",
} as const;

export function PairingsSection(props: PairingsSectionProps) {
  const titleId = `${PAIRINGS_ID}-title`;

  return (
    <section id={PAIRINGS_ID} aria-labelledby={titleId} className={STYLES.section}>
      <div className={STYLES.inner}>
        <div className={STYLES.head}>
          <SectionHeading id={titleId} section="pairings" />
        </div>

        <Carousel
          key={props.pairings.map((p) => p.id).join("-")}
          labelledBy={titleId}
          dots
          className={STYLES.carousel}
        >
          {props.pairings.map((pairing) => (
            <div key={pairing.id} className={STYLES.slide}>
              <PairingCard
                pairing={pairing}
                onOpen={() => props.onOpen(pairing)}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
