import { type Request, type Response, type NextFunction } from "express";
import { type User as LuciaUser } from "lucia";

import { getMedia, getTrending } from "./media-service.js";
import { mediaSchema, trendingSchema } from "./media-validates.js";
import { getUserMediaData } from "../user/user-service.js";

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

  const media: any = await getMedia(id, type);

  const user: LuciaUser | null = res.locals.user;
  if (user != null) {
    media.watched = await getUserMediaData(user.id, id);
  }
  res.json(media);
}
