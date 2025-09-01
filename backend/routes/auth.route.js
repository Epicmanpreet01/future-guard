import { Router } from "express";
import { login, registerSuperAdmin } from "../controllers/auth.controller.js";

const router = Router();
router.post("/login", login);
router.post("/superAdmin/register", registerSuperAdmin);

export default router;
