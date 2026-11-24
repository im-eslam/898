export const ROUTES = {
  landing: "/",
  review: "/review",
  menu: "/menu",
  dashboard: "/admin",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
