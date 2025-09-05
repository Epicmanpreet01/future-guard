import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  adminAggreg,
  superAdminAggreg,
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

export default router;
