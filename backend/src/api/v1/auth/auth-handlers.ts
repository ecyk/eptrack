import argon2 from "argon2";
import { type Request, type Response, type NextFunction } from "express";
import { CONFLICT, CREATED, OK, UNAUTHORIZED } from "http-status";
import jwt from "jsonwebtoken";

import { AppError } from "../../../app-error";
import { jwtSecret } from "../../../vars";
import userModel from "../user/user-model";

// eslint-disable-next-line
async function verifyUser(username: string, password: string) {
  const user = await userModel.findOne({ username }).exec();
  if (user == null || !(await argon2.verify(user.hashedPassword, password))) {
    throw new AppError(UNAUTHORIZED, "Invaild username or password");
  }
  return user;
}

export async function login(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  const user = await verifyUser(username, password);

  res.status(OK).send({
    code: OK,
    token: jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: "1h" }),
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  const hashedPassword = await argon2.hash(password);
  try {
    await userModel.create({ username, hashedPassword });
  } catch (err: any) {
    if (err.code === 11000) {
      throw new AppError(CONFLICT, "User already exists");
    }
    next(err);
    return;
  }

  res.status(CREATED).send({
    code: CREATED,
    message: "User registered successfully",
  });
}

export async function resetPassword(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { username, password, newPassword } = req.body as {
    username: string;
    password: string;
    newPassword: string;
  };

  const user = await verifyUser(username, password);
  user.hashedPassword = await argon2.hash(newPassword);
  await user.save();

  res.status(OK).send({
    code: OK,
    message: "Password changed successfully",
  });
}
