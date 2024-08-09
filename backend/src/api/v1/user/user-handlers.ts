import { type Request, type Response, type NextFunction } from "express";
import status from "http-status";
import { type User } from "lucia";

import { updateUserMediaData } from "./user-service.js";
import { updateUserMediaDataSchema } from "./user-validates.js";

export async function handleUpdateUserData(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { mediaId, data } = updateUserMediaDataSchema.parse(req.body);
  await updateUserMediaData((res.locals.user as User).id, mediaId, data);
  res.status(status.NO_CONTENT).send();
}
