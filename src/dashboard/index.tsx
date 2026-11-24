import { ErrorPage } from "@/features/states/error/";
import { LoadingPage } from "@/features/states/loading/";
import { LoginPage } from "./login";
import { useSession } from "./hooks/use-session";
import { DashboardShell } from "./shell";

export function DashboardPage() {
  const session = useSession();

  if (session.admin) return <DashboardShell />;

  if (session.isError) {
    return (
      <ErrorPage
        kind={session.errorCode === "NETWORK" ? "network" : "generic"}
        onRetry={session.retry}
      />
    );
  }

  if (session.isPending) return <LoadingPage kind="spinner" />;

  return <LoginPage />;
}
