import { lazy, Suspense } from "react";
import { LoadingPage } from "@/features/states/loading/";
import { LandingPage } from "@/features/landing/";
import { ReviewPage } from "@/features/review/";
import { ROUTES, Route, Switch } from "@/shared/router";

const MissingPage = lazy(() =>
  import("@/features/states/missing/").then((m) => ({ default: m.MissingPage }))
);

const MenuPage = lazy(() =>
  import("@/features/menu/").then((m) => ({ default: m.MenuPage }))
);

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingPage kind="spinner" />}>
        <Switch>
          <Route path={ROUTES.landing}>
            <LandingPage />
          </Route>
          <Route path={ROUTES.review}>
            <LandingPage />
          </Route>
          <Route path={ROUTES.menu}>
            <Suspense fallback={<LoadingPage kind="menu" />}>
              <MenuPage />
            </Suspense>
          </Route>
          <Route>
            <MissingPage />
          </Route>
        </Switch>
      </Suspense>
      <ReviewPage />
    </>
  );
}
