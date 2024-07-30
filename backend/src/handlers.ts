import { type Request, type Response, type NextFunction } from "express";
import httpStatus, {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
} from "http-status";
import passport from "passport";
import { ZodError, type ZodSchema } from "zod";

import { AppError } from "./app-error";
import logger from "./logger";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err || !user) { // eslint-disable-line
      next(new AppError(UNAUTHORIZED, httpStatus[UNAUTHORIZED]));
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = `Invalid request (${err.errors
          .map((e) => `${e.path.join(".")}:${e.message}`)
          .join(",")})`;
        next(new AppError(UNPROCESSABLE_ENTITY, message));
        return;
      }
      next(err);
    }
  };
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new AppError(NOT_FOUND, httpStatus[NOT_FOUND]));
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode, message } = err;
  logger.error(err);
  if (!err.isOperational) {
    statusCode = INTERNAL_SERVER_ERROR;
    message = httpStatus[INTERNAL_SERVER_ERROR];
  }
  res.status(statusCode).send({
    code: statusCode,
    message,
  });
};
