import { Router } from "express";
import {
  login,
  logout,
  registerSuperAdmin,
  getUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middlware.js";

const router = Router();

router.post("/login", login);
router.post("/superAdmin/register", registerSuperAdmin);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getUser);

export default router;
