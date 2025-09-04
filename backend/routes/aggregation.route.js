import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";

const router = Router();

router.get("/superadmin/stats", authMiddleware, authorizeRoles(["superAdmin"]));

router.get("/admin/stats", authMiddleware, authorizeRoles(["admin"]));

export default router;
