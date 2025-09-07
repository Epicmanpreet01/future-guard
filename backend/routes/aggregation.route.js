import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  adminAggreg,
  superAdminAggreg,
  mentorAggreg,
} from "../controllers/aggregration.controller.js";

const router = Router();

router.get(
  "/superadmin/stats",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  superAdminAggreg
);

router.get(
  "/admin/stats",
  authMiddleware,
  authorizeRoles(["admin"]),
  adminAggreg
);

router.get(
  "/mentor/stats",
  authMiddleware,
  authorizeRoles(["mentor"]),
  mentorAggreg
);

export default router;
