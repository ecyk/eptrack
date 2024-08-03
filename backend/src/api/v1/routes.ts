import { Router } from "express";

import authRoutes from "./auth/auth-routes.js";
import mediaRoutes from "./media/media-routes.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.send("OK");
});

router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);

export default router;
