import z from "zod";

export const updateUserMediaDataSchema = z.object({
  mediaId: z.number().positive(),
  data: z.array(z.tuple([z.number(), z.boolean()])).min(1),
});
