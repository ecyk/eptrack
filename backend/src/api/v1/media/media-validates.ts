import z from "zod";

export const trendingSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(500)),
});

export const searchSchema = z
  .object({
    tags: z
      .string()
      .transform((val) => val.split(",").map((str) => parseInt(str, 10)))
      .refine((val) => val.every((num) => !isNaN(num)), {
        message: "Tags must be an array of numbers.",
      })
      .optional(),
    query: z.string().max(100).optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive().max(500))
      .optional(),
  })
  .refine(
    (data) =>
      (data.tags != null && data.query == null && data.page == null) ||
      (data.tags == null && data.query != null && data.page),
    {
      message: "Provide either tags or both query and page.",
    }
  );

export const mediaSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  type: z.enum(["movie", "tv"]),
});
