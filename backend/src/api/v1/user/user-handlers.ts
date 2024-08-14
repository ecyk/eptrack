import { type Request, type Response, type NextFunction } from "express";
import status from "http-status";
import { type User } from "lucia";

import {
  createTag,
  deleteTag,
  getAllTags,
  updateMediaData,
} from "./user-service.js";
import { tagSchema, updateMediaDataSchema } from "./user-validates.js";

export async function handleUpdateMediaData(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { mediaId, type, tags, watchedEpisodes } = updateMediaDataSchema.parse(
    req.body
  );
  const userId = (res.locals.user as User).id;
  await updateMediaData(userId, mediaId, type, tags, watchedEpisodes);
  res.status(status.NO_CONTENT).send();
}

export async function handleGetAllTags(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const userId = (res.locals.user as User).id;
  res.send(await getAllTags(userId));
}

export async function handleCreateTag(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { name } = tagSchema.parse(req.body);
  const userId = (res.locals.user as User).id;
  const tagId = await createTag(userId, name);
  res.send({ tagId });
}

export async function handleDeleteTag(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { name } = tagSchema.parse(req.body);
  const userId = (res.locals.user as User).id;
  await deleteTag(userId, name);
  res.status(status.NO_CONTENT).send();
}
