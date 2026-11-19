export const ROUTES = {
  landing: "/",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
