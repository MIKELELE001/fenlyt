import { z } from "zod";

// Source registration schema — shared by the /sources/new form (client) and
// the POST /api/sources route (server). See CLAUDE.md section 14.
export const sourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  authorName: z.string().min(2, "Author name must be at least 2 characters."),
  sourceType: z.literal("TEXT"),
  sourceUrl: z
    .string()
    .url("Enter a valid URL (including https://).")
    .optional()
    .or(z.literal("")),
  content: z.string().min(100, "Content must be at least 100 characters."),
  payoutAddress: z.string().min(5, "Enter a valid payout address."),
  pricePerUseUsd: z
    .string()
    .refine((v) => parseFloat(v) > 0, "Price must be greater than 0."),
});

export type SourceFormValues = z.infer<typeof sourceSchema>;
