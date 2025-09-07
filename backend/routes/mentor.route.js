import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
import { uploadFile } from "../controllers/mentor.controller.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  authorizeRoles(["mentor"]),
  upload.array("files", 5),
  uploadFile
);

export default router;
