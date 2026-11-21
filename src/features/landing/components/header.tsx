import logo from "@/assets/mark.svg";
import { useStrings } from "@/shared/i18n";
import { strings } from "../strings";

const STYLES = {
  header: "flex flex-col items-center pt-10 text-center",
  logo: "h-auto w-[clamp(10.5rem,50vw,13rem)]",
  tagline: "mt-5 max-w-72 text-body text-navy",
  emphasis: "font-bold text-brand",
} as const;

function mapStrings(s: typeof strings.en) {
  return {
    brandName: s.header.brandName,
    taglineLead: s.header.taglineLead,
    taglineEmphasis: s.header.taglineEmphasis,
  };
}

export function Header() {
  const { brandName, taglineLead, taglineEmphasis } = mapStrings(
    useStrings(strings)
  );

  return (
    <header className={STYLES.header}>
      <h1>
        <img
          src={logo}
          alt={brandName}
          width={462}
          height={447}
          fetchPriority="high"
          decoding="async"
          className={STYLES.logo}
        />
      </h1>
      <p className={STYLES.tagline}>
        {taglineLead} <span className={STYLES.emphasis}>{taglineEmphasis}</span>
      </p>
    </header>
  );
}
