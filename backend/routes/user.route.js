import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";

const router = Router();

// superAdmin routes
router.get("/admin", authMiddleware, authorizeRoles(["superAdmin"]));
router.get("admin/:adminId", authMiddleware, authorizeRoles(["superAdmin"]));
router.post("/admin/:adminId", authMiddleware, authorizeRoles(["superAdmin"]));

// admin routes
router.get("/mentor", authMiddleware, authorizeRoles(["admin"]));
router.get("/mentor/:mentorId", authMiddleware, authorizeRoles(["admin"]));
router.post("/mentor/:mentorId", authMiddleware, authorizeRoles(["admin"]));
router.delete("/mentor/:mentor", authMiddleware, authorizeRoles(["admin"]));

export default router;
