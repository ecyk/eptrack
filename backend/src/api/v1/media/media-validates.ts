import z from "zod";

export const trendingSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(500)),
});

export const mediaSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  type: z.enum(["movie", "tv"]),
});
