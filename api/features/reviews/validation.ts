import { z } from "zod";
import { reviewLimits } from "./schema.js";

const noNulBytes = (value: string) => !value.includes("\0");

const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine(noNulBytes, "Invalid character")
    .refine(
      (value) => [...value].length >= min && [...value].length <= max,
      `Must be ${min} to ${max} characters`
    );

const numericParam = (fallback: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((value) =>
      Math.min(max, Math.max(1, Number(value ?? fallback)))
    );

export const reviewValidation = {
  create: z.object({
    message: text(reviewLimits.message.min, reviewLimits.message.max),
    name: text(0, reviewLimits.name.max)
      .optional()
      .transform((value) => value ?? ""),
    contact: text(0, reviewLimits.contact.max)
      .optional()
      .transform((value) => value ?? ""),
    website: z.string().max(200).optional(),
  }),
  list: z.object({
    q: z
      .string()
      .trim()
      .max(reviewLimits.search.max)
      .refine(noNulBytes, "Invalid character")
      .optional(),
    page: numericParam(1, reviewLimits.paging.maxPage),
    per_page: numericParam(
      reviewLimits.paging.defaultPerPage,
      reviewLimits.paging.maxPerPage
    ),
  }),
  remove: z.object({
    ids: z
      .array(z.number().int().min(1).max(2_147_483_647))
      .min(1)
      .max(reviewLimits.bulkDelete.maxIds)
      .transform((ids) => [...new Set(ids)]),
  }),
} as const;
