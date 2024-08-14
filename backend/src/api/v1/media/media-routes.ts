import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import {
  handleGetTrending,
  handleGetSearch,
  handleGetMedia,
} from "./media-handlers.js";

const mediaRoutes = Router();

mediaRoutes.route("/trending").get(expressAsyncHandler(handleGetTrending));
mediaRoutes.route("/search").get(expressAsyncHandler(handleGetSearch));

mediaRoutes.route("/:mediaId").get(expressAsyncHandler(handleGetMedia));

export default mediaRoutes;
