import { Router } from "express";

import authRoutes from "./auth/auth-routes.js";
import mediaRoutes from "./media/media-routes.js";
import userRoutes from "./user/user-routes.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.send("OK");
});

router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/user", userRoutes);

export default router;
