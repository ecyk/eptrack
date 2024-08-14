import { type Request, type Response, type NextFunction } from "express";
import status from "http-status";
import { type User as LuciaUser } from "lucia";

import { getMedia, getTrending, searchMedia } from "./media-service.js";
import { type Media } from "./media-types.js";
import {
  mediaSchema,
  trendingSchema,
  searchSchema,
} from "./media-validates.js";
import { AppError } from "../../../app-error.js";
import { getMediaData, getMediasByTagIds } from "../user/user-service.js";

export async function handleGetTrending(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { page } = trendingSchema.parse(req.query);
  res.json(await getTrending(page));
}

export async function handleGetSearch(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { tags, query, page } = searchSchema.parse(req.query);
  const user: LuciaUser | null = res.locals.user;
  if (tags != null) {
    if (user == null) {
      throw new AppError(status.BAD_REQUEST, "Invaild user");
    }

    const medias = await getMediasByTagIds(user.id, tags);
    const results: Media[] = [];
    for (const media of medias) {
      const detail = await getMedia(media.mediaId, media.type);
      results.push({
        id: detail.id,
        name: detail.name,
        type: detail.type,
        poster_path: detail.poster_path,
      });
    }
    res.json({ results });
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  res.json(await searchMedia(query!, page!));
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
    const data = await getMediaData(user.id, id);
    media.tags = data?.tags ?? [];
    media.watchedEpisodes = data?.watchedEpisodes ?? [];
  }
  res.json(media);
}
