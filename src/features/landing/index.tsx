import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import { ROUTES } from "@/shared/router";
import { Background } from "./components/background";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { LanguageToggle } from "./components/language-toggle";
import { ActionCard } from "./components/ui/action-card";
import { SectionTitle } from "./components/ui/section-title";
import { site } from "./site";
import { strings } from "./strings";

const STYLES = {
  main: "relative isolate",
  container:
    "relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]",
  languageToggle: "absolute end-6 top-6 z-10",
  nav: "flex flex-1 flex-col gap-6",
  stack: "flex flex-col gap-3",
} as const;

export function LandingPage() {
  const s = useStrings(strings);
  const otherLocale = useLocale() === "en" ? "ar" : "en";

  return (
    <main className={STYLES.main}>
      <Background />

      <div className={STYLES.container}>
        <div className={STYLES.languageToggle}>
          <LanguageToggle onPress={() => setLocale(otherLocale)} />
        </div>

        <Header />

        <nav className={STYLES.nav}>
          <div className={STYLES.stack}>
            <ActionCard
              icon="cup"
              tone="featured"
              to={ROUTES.menu}
              strings={{
                title: s.sections.primary.menu.title,
                hint: s.sections.primary.menu.hint,
              }}
            />
            <ActionCard
              icon="star"
              to={ROUTES.review}
              strings={{
                title: s.sections.primary.review.title,
                hint: s.sections.primary.review.hint,
              }}
            />
          </div>

          <section className={STYLES.stack}>
            <SectionTitle strings={{ title: s.sections.social.heading }} />
            <ActionCard
              icon="instagram"
              tone="social"
              href={site.instagram.url}
              strings={{
                title: s.sections.social.title,
                hint: s.sections.social.hint,
              }}
            />
          </section>

          <section className={STYLES.stack}>
            <SectionTitle strings={{ title: s.sections.location.heading }} />
            <ActionCard
              icon="pin"
              href={site.location.mapsUrl}
              strings={{ title: s.sections.location.title }}
            />
          </section>
        </nav>

        <Footer />
      </div>
    </main>
  );
}
