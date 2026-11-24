const BASE =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-small font-bold transition-colors ease-smooth outline-none focus-visible:outline-2 focus-visible:outline-offset-2 data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const CONTROL_STYLES = {
  button: `${BASE} border border-sand bg-white text-charcoal [@media(hover:hover)_and_(pointer:fine)]:hover:bg-arctic focus-visible:outline-brand`,
  buttonDanger: `${BASE} bg-error text-white [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90 focus-visible:outline-error`,
  iconButton:
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand ring-1 ring-black/5 transition-colors ease-smooth outline-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-arctic focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  input:
    "h-11 w-full rounded-full border border-sand bg-white ps-11 pe-11 text-body text-charcoal outline-none transition-colors ease-smooth placeholder:text-charcoal/55 data-focused:border-brand data-focused:ring-2 data-focused:ring-brand/25 [&::-webkit-search-cancel-button]:hidden",
} as const;
