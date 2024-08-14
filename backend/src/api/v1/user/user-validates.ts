import z from "zod";

export const updateMediaDataSchema = z.object({
  mediaId: z.number().positive(),
  type: z.enum(["tv", "movie"]),
  tags: z.array(z.tuple([z.number(), z.boolean()])),
  watchedEpisodes: z.array(z.tuple([z.number(), z.boolean()])),
});

export const tagSchema = z.object({
  name: z.string().min(3).max(100),
});
