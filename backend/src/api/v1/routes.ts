import { Router } from "express";

import authRoutes from "./auth/auth-routes.js";

const router = Router();

router.use("/auth", authRoutes);

router.get("/status", (_req, res) => {
  res.send("OK");
});

export default router;
