import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import { getMetaData } from "../controllers/metadata.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles(["superAdmin", "admin"]),
  getMetaData
);

export default router;
