import { LandingPage } from "@/features/landing/";
import { ReviewPage } from "@/features/review/";
import { ROUTES, Route, Switch } from "@/shared/router";

export default function App() {
  return (
    <>
      <Switch>
        <Route path={ROUTES.landing}>
          <LandingPage />
        </Route>
        <Route path={ROUTES.review}>
          <LandingPage />
        </Route>
      </Switch>
      <ReviewPage />
    </>
  );
}
