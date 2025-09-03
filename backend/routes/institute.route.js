import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  generateDraftConfig,
  getCurrInstitute,
  getInstituteById,
  getInstitutes,
  lockConfig,
  removeInstitute,
  updateConfig,
} from "../controllers/institute.controller.js";

const router = Router();

router.delete(
  "/:instituteId",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  removeInstitute
);
router.get("/", authMiddleware, authorizeRoles(["superAdmin"]), getInstitutes);
router.get(
  "/:instituteId",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  getInstituteById
);

// config routes
router.get(
  "/my",
  authMiddleware,
  authorizeRoles(["admin", "mentor"]),
  getCurrInstitute
);
router.post(
  "/config/draft",
  authMiddleware,
  authorizeRoles(["admin"]),
  generateDraftConfig
);
router.put("/config", authMiddleware, authorizeRoles(["admin"]), updateConfig);
router.post(
  "/config/lock",
  authMiddleware,
  authorizeRoles(["admin", "superAdmin"]),
  lockConfig
);

router;

export default router;
