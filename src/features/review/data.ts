export const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJ6TmFLgCd9xQRJhy85GpSRQ4";

export const REVIEW_LIMITS = {
  message: { min: 3, max: 1000 },
  name: { max: 80 },
  contact: { max: 120 },
} as const;
