import { Router } from "express";
import {
  login,
  logout,
  registerSuperAdmin,
  getUser,
  registerInstituteWithAdmin,
  registerMentor,
} from "../controllers/auth.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";

const router = Router();

router.post("/login", login);

router.post("/register", registerSuperAdmin);

router.post(
  "/admin-register",
  authMiddleware,
  authorizeRoles(["superAdmin"]),
  registerInstituteWithAdmin
);

router.post(
  "/mentor-register",
  authMiddleware,
  authorizeRoles(["admin"]),
  registerMentor
);

router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, getUser);

export default router;
