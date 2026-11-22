import logo from "@/assets/mark.svg";
import { useStrings } from "@/shared/i18n";
import { strings } from "../strings";

const STYLES = {
  header: "flex flex-col items-center pt-10 text-center",
  logo: "h-auto w-[clamp(10.5rem,50vw,13rem)]",
  tagline: "mt-5 max-w-72 text-body text-navy",
  emphasis: "font-bold text-brand",
} as const;

export function Header() {
  const { header } = useStrings(strings);

  return (
    <header className={STYLES.header}>
      <h1>
        <img
          src={logo}
          alt={header.brandName}
          width={462}
          height={447}
          fetchPriority="high"
          decoding="async"
          className={STYLES.logo}
        />
      </h1>
      <p className={STYLES.tagline}>
        {header.taglineLead}{" "}
        <span className={STYLES.emphasis}>{header.taglineEmphasis}</span>
      </p>
    </header>
  );
}
