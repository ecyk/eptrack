import { Router } from "express";

import { authorize } from "./auth/auth-middlewares.js";
import authRoutes from "./auth/auth-routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.get("/status", (req, res) => {
  res.send("OK");
});

export default router;
