import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  getCurrInstitute,
  getInstituteById,
  getInstitutes,
  postConfig,
  removeInstitute,
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
// router.post("/config", authMiddleware, authorizeRoles(["admin"]), postConfig);

export default router;
