import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import {
  handleGoogleAuth,
  handleGoogleAuthCallback,
  handleLogout,
} from "./auth-handlers.js";
import { protect } from "./auth-middlewares.js";

const authRouter = Router();

authRouter.route("/google").get(expressAsyncHandler(handleGoogleAuth));
authRouter.route("/google/callback").get(expressAsyncHandler(handleGoogleAuthCallback));

authRouter.route("/logout").post(protect, expressAsyncHandler(handleLogout));

export default authRouter;
