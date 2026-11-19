export const ROUTES = {
  landing: "/",
  review: "/review",
  menu: "/menu",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
