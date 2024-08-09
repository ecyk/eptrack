import { type Request, type Response, type NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import status from "http-status";
import { verifyRequestOrigin } from "lucia";

import { lucia } from "./auth-strategy.js";
import { AppError } from "../../../app-error.js";

export function authorize(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  expressAsyncHandler(async (req, res, next) => {
    if (req.method !== "GET") {
      const originHeader = req.headers.origin ?? null;
      const hostHeader = req.headers.host ?? null;
      if (
        originHeader == null ||
        hostHeader == null ||
        !verifyRequestOrigin(originHeader, [hostHeader])
      ) {
        throw new AppError(status.FORBIDDEN, status[status.FORBIDDEN]);
      }
    }

    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
    if (sessionId == null) {
      res.locals.user = null;
      res.locals.session = null;
      next();
      return;
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session != null && session.fresh) {
      res.appendHeader(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize()
      );
    }
    if (session == null) {
      res.appendHeader(
        "Set-Cookie",
        lucia.createBlankSessionCookie().serialize()
      );
    }
    res.locals.user = user;
    res.locals.session = session;
    next();
  })(req, res, next);
}

export function protect(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.locals.session == null) {
    throw new AppError(status.UNAUTHORIZED, status[status.UNAUTHORIZED]);
  }
  next();
}
