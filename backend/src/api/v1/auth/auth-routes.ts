import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { authGoogle, authGoogleCallback, logout } from "./auth-handlers.js";
import { authorize } from "./auth-middlewares.js";

const authRouter = Router();

authRouter.route("/google").get(expressAsyncHandler(authGoogle));
authRouter.route("/google/callback").get(expressAsyncHandler(authGoogleCallback));

authRouter.route("/logout").post(authorize, expressAsyncHandler(logout));

export default authRouter;
