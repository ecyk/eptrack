import { type Request, type Response, type NextFunction } from "express";
import status from "http-status";

import { AppError } from "../../../app-error.js";
import { lucia } from "./auth-strategy.js";
import { verifyRequestOrigin } from "lucia";
import expressAsyncHandler from "express-async-handler";

export function authorize(req: Request, res: Response, next: NextFunction) {
  return expressAsyncHandler(async (req, res, next) => {
    if (req.method !== "GET") {
      const originHeader = req.headers.origin ?? null;
      // NOTE: You may need to use `X-Forwarded-Host` instead
      const hostHeader = req.headers.host ?? null;
      if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
      ) {
        throw new AppError(status.FORBIDDEN, status[status.FORBIDDEN]);
      }
    }

    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
    if (!sessionId) {
      throw new AppError(status.UNAUTHORIZED, status[status.UNAUTHORIZED]);
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      res.appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
    }
    if (!session) {
      res.appendHeader(
        "Set-Cookie",
        lucia.createBlankSessionCookie().serialize()
      );
    }
    res.locals.user = user;
    res.locals.session = session;
    return next();
  })(req, res, next);
}
