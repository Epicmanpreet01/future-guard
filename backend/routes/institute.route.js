import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middlware";

const router = Router();

router.post("/create", authMiddleware, authorizeRoles(["superAdmin"]));
router.delete("/delete", authMiddleware, authorizeRoles(["superAdmin"]));
router.get("/get", authMiddleware, authorizeRoles(["superAdmin"]));
router.get("/get:instituteId", authMiddleware, authorizeRoles(["superAdmin"]));

export default router;
