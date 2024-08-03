import { type Request, type Response, type NextFunction } from "express";

import { getMedia, getTrending } from "./media-service.js";
import { mediaSchema, trendingSchema } from "./media-validates.js";

export async function handleGetTrending(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { page } = trendingSchema.parse(req.query);
  res.json(await getTrending(page));
}

export async function handleGetMedia(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { id, type } = mediaSchema.parse({
    id: req.params.mediaId,
    type: req.query.type,
  });
  res.json(await getMedia(id, type));
}
