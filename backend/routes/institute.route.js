import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  getInstituteById,
  getInstitutes,
  removeInstitute,
} from "../controllers/institute.controller.js";

const router = Router();

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

export default router;
