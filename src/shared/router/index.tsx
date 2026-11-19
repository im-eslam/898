/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as WouterLink, Route, Switch, useLocation } from "wouter";
import { ROUTES, type AppRoute } from "./data";

interface AppLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className"
> {
  href: AppRoute;
  children: ReactNode;
  className?: string | ((isActive: boolean) => string | undefined);
}

function Link({ href, children, ...rest }: AppLinkProps) {
  return (
    <WouterLink href={href} {...rest}>
      {children}
    </WouterLink>
  );
}

function ScrollToTop(): null {
  const [pathname] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export { Route, Switch, useLocation, ROUTES, type AppRoute, Link, ScrollToTop };
