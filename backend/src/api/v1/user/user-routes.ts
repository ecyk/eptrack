import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { handleUpdateUserData } from "./user-handlers.js";
import { protect } from "../auth/auth-middlewares.js";

const userRoutes = Router();

userRoutes.route("/media").post(protect, expressAsyncHandler(handleUpdateUserData));

export default userRoutes;
