import { z } from "zod";
import { reviewLimits } from "./schema.js";

const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => !value.includes("\0"), "Invalid character")
    .refine(
      (value) => [...value].length >= min && [...value].length <= max,
      `Must be ${min} to ${max} characters`
    );

const createReviewSchema = z.object({
  message: text(reviewLimits.message.min, reviewLimits.message.max),
  name: text(0, reviewLimits.name.max)
    .optional()
    .transform((value) => value ?? ""),
  contact: text(0, reviewLimits.contact.max)
    .optional()
    .transform((value) => value ?? ""),
  website: z.string().max(200).optional(),
});

const numericParam = (fallback: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((value) =>
      Math.min(max, Math.max(1, Number(value ?? fallback)))
    );

const reviewListSchema = z.object({
  q: z.string().trim().max(reviewLimits.search.max).optional(),
  page: numericParam(1, reviewLimits.paging.maxPage),
  per_page: numericParam(
    reviewLimits.paging.defaultPerPage,
    reviewLimits.paging.maxPerPage
  ),
});

const deleteReviewsSchema = z.object({
  ids: z
    .array(z.number().int().min(1).max(2_147_483_647))
    .min(1)
    .max(reviewLimits.bulkDelete.maxIds)
    .transform((ids) => [...new Set(ids)]),
});

export type ReviewListQuery = z.output<typeof reviewListSchema>;
export type NewReview = Pick<
  z.output<typeof createReviewSchema>,
  "name" | "contact" | "message"
>;

export const reviewValidation = {
  create: createReviewSchema,
  list: reviewListSchema,
  remove: deleteReviewsSchema,
} as const;
