import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { login, register, resetPassword } from "./auth-handlers";
import {
  loginSchema,
  registerSchema,
  passwordResetSchema,
} from "./auth-validates";
import { validate } from "../../../handlers";

const authRouter = Router();

authRouter
  .route("/login")
  .post(validate(loginSchema), expressAsyncHandler(login));
authRouter
  .route("/register")
  .post(validate(registerSchema), expressAsyncHandler(register));
authRouter
  .route("/reset")
  .post(validate(passwordResetSchema), expressAsyncHandler(resetPassword));

export default authRouter;
