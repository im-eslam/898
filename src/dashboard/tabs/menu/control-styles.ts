const BASE_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-small font-bold transition-colors ease-smooth outline-none focus-visible:outline-2 focus-visible:outline-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const CONTROL_STYLES = {
  button: `${BASE_BUTTON} border border-navy/15 bg-white text-navy [@media(hover:hover)_and_(pointer:fine)]:hover:bg-cream focus-visible:outline-brand`,
  buttonPrimary: `${BASE_BUTTON} bg-brand text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-navy focus-visible:outline-brand`,
  buttonDanger: `${BASE_BUTTON} bg-error text-white [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90 focus-visible:outline-error`,
  iconButton:
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand ring-1 ring-navy/10 transition-colors ease-smooth outline-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  iconButtonDanger:
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-error ring-1 ring-error/20 transition-colors ease-smooth outline-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error data-disabled:pointer-events-none data-disabled:opacity-40",
  iconButtonGhost:
    "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-navy/60 transition-colors ease-smooth outline-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-disabled:pointer-events-none data-disabled:opacity-30",
  card: "rounded-lg border border-navy/10 bg-white p-4 shadow-card",
} as const;
