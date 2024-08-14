import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import {
  handleUpdateMediaData,
  handleGetAllTags,
  handleCreateTag,
  handleDeleteTag,
} from "./user-handlers.js";
import { protect } from "../auth/auth-middlewares.js";

const userRoutes = Router();

userRoutes.route("/medias").post(protect, expressAsyncHandler(handleUpdateMediaData));

userRoutes.route("/tags").get(protect, expressAsyncHandler(handleGetAllTags));
userRoutes.route("/tags").post(protect, expressAsyncHandler(handleCreateTag));
userRoutes.route("/tags").delete(protect, expressAsyncHandler(handleDeleteTag));

export default userRoutes;
