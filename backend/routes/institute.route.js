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
  postConfig,
  removeInstitute,
  updateConfig,
} from "../controllers/institute.controller.js";

const router = Router();
// superAdmin routes
// delete institute with id
router.delete(
  "/:instituteId",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  removeInstitute
);
// get all institute
router.get("/", authMiddleware, authorizeRoles(["superAdmin"]), getInstitutes);
// get institute by id
router.get(
  "/:instituteId",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  getInstituteById
);

// admin routes
router.get("/my", authMiddleware, authorizeRoles(["admin"]), getCurrInstitute);
router.post(
  "/config/draft",
  authMiddleware,
  authorizeRoles(["admin"]),
  generateDraftConfig
);
router.post("/config", authMiddleware, authorizeRoles(["admin"]), updateConfig);
router.post(
  "/config/lock",
  authMiddleware,
  authorizeRoles(["admin", "superAdmin"]),
  lockConfig
);

export default router;
