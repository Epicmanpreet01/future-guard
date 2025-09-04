import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import {
  deactivateActivateAdmin,
  updateMentor,
  getAdminById,
  getAdmins,
  getMentorById,
  getMentors,
  removeMentor,
} from "../controllers/user.controler.js";

const router = Router();

// superAdmin routes
router.get("/admin", authMiddleware, authorizeRoles(["superAdmin"]), getAdmins);
router.get(
  "/admin/:adminId",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  getAdminById
);
router.post(
  "/admin/:adminId",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  deactivateActivateAdmin
);

// admin routes
router.get("/mentor", authMiddleware, authorizeRoles(["admin"]), getMentors);
router.get(
  "/mentor/:mentorId",
  authMiddleware,
  authorizeRoles(["admin"]),
  getMentorById
);
router.post(
  "/mentor/:mentorId",
  authMiddleware,
  authorizeRoles(["admin"]),
  updateMentor
);
router.delete(
  "/mentor/:mentorId",
  authMiddleware,
  authorizeRoles(["admin"]),
  removeMentor
);

export default router;
