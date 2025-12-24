import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  getCurrInstitute,
  getInstituteById,
  getInstitutes,
  removeInstitute,
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
  "/current/my",
  authMiddleware,
  authorizeRoles(["admin", "mentor"]),
  getCurrInstitute
);

export default router;
