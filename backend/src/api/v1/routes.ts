import { Router } from "express";

import authRoutes from "./auth/auth-routes";

const router = Router();

router.get("/status", (_req, res) => res.send("OK"));

router.use("/auth", authRoutes);

export default router;
