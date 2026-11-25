export const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const BASE_BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-small font-bold transition-colors ease-smooth data-disabled:cursor-not-allowed data-disabled:opacity-50";

const BASE_ICON =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white transition-colors ease-smooth";

export const CONTROL_STYLES = {
  button: `${BASE_BUTTON} border border-navy/15 bg-white text-navy hover:bg-cream ${FOCUS_RING}`,
  buttonPrimary: `${BASE_BUTTON} bg-brand text-white hover:bg-navy ${FOCUS_RING}`,
  buttonDanger: `${BASE_BUTTON} bg-error text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error outline-none`,
  iconButton: `${BASE_ICON} border border-navy/15 text-brand hover:bg-cream ${FOCUS_RING}`,
  iconButtonDanger: `${BASE_ICON} border border-error/25 text-error hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error outline-none data-disabled:pointer-events-none data-disabled:opacity-40`,
  pill: `inline-flex h-11 shrink-0 items-center rounded-full border border-navy/15 bg-white px-4 text-small font-bold text-navy/70 transition-colors ease-smooth ${FOCUS_RING} data-selected:border-brand data-selected:bg-brand data-selected:text-white`,
} as const;

// Text fields. `control` has no padding so each field sets its own, which keeps
// suffixes and icons from fighting with a shared padding class.
export const FIELD = {
  label: "text-small font-bold text-navy",
  control:
    "w-full min-h-11 rounded-md border border-navy/15 bg-white text-body text-navy placeholder:text-navy/60 outline-none transition-colors ease-smooth focus:border-brand data-invalid:border-error aria-invalid:border-error",
  hint: "text-caption text-navy/70",
  error: "text-small font-bold text-error",
} as const;

export const LIST = {
  stack: "flex flex-col gap-2",
  empty:
    "rounded-lg border border-dashed border-navy/20 p-6 text-center text-small text-navy/70",
  thumb:
    "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-navy/10 bg-cream",
  title: "block truncate text-body font-bold text-navy",
  meta: "block truncate text-caption text-navy/70",
} as const;

export const SPINNER =
  "size-6 motion-safe:animate-spin rounded-full border-2 border-brand/20 border-t-brand";
