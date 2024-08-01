import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authGoogle, authGoogleCallback } from "./auth-handlers.js";
import config from "../../../config.js";
import rateLimit from "express-rate-limit";

const authRouter = Router();

if (config.env === "production") {
  authRouter.use(
    "/",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );
}

authRouter.route("/google").get(expressAsyncHandler(authGoogle));
authRouter.route("/google/callback").get(expressAsyncHandler(authGoogleCallback));

export default authRouter;
