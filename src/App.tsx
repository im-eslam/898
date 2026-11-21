import { lazy, Suspense } from "react";
import { ReviewPage } from "@/features/review/";
import { LoadingPage } from "@/features/states/loading/";
import { MissingPage } from "@/features/states/missing/";
import { ROUTES, Route, Switch } from "@/shared/router";

const LandingPage = lazy(() =>
  import("@/features/landing/").then((m) => ({ default: m.LandingPage }))
);

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingPage />}>
        <Switch>
          <Route path={ROUTES.landing}>
            <LandingPage />
          </Route>
          <Route path={ROUTES.review}>
            <LandingPage />
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
