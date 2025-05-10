import { z } from "zod";

const seasonSchema = z.array(z.string());

const showSchema = z.object({
  tags: z.array(z.string()).optional(),
  seasons: z.record(z.string(), seasonSchema).optional(),
});

const movieSchema = z.object({
  tags: z.array(z.string()).optional(),
});

export const userDataSchema = z.object({
  tags: z.record(z.string(), z.array(z.string())),
  movies: z.record(z.string(), movieSchema),
  shows: z.record(z.string(), showSchema),
});

export type UserData = z.infer<typeof userDataSchema>;
