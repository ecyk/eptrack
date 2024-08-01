import { OAuth2RequestError } from "arctic";
import { type Request, type Response, type NextFunction } from "express";
import status from "http-status";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

import { AppError } from "./app-error.js";
import config from "./config.js";
import logger from "./logger.js";

function errorConverter(
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  let error = err;
  if (!(error instanceof AppError)) {
    let statusCode: number;
    let message: string;
    let isOperational = false;

    if (error instanceof mongoose.Error) {
      statusCode = status.INTERNAL_SERVER_ERROR;
      message = error.message;
    } else if (error instanceof ZodError) {
      statusCode = status.BAD_REQUEST;
      message = fromError(error).toString();
      isOperational = true;
    } else if (
      error instanceof OAuth2RequestError &&
      error.message === "bad_verification_code"
    ) {
      statusCode = status.BAD_REQUEST;
      message = "Invalid verification code";
      isOperational = true;
    } else {
      statusCode = error.statusCode
        ? status.BAD_REQUEST
        : status.INTERNAL_SERVER_ERROR;
      message =
        error.message ??
        (error.statusCode
          ? status[status.BAD_REQUEST]
          : status[status.INTERNAL_SERVER_ERROR]);
    }

    error = new AppError(
      statusCode,
      message,
      isOperational,
      error.stack as string | undefined
    );
  }
  next(error);
}

function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let { statusCode, message } = err;
  if (config.env === "production" && !err.isOperational) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = status[status.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
}

export { errorConverter, errorHandler };
