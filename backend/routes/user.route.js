import { Router } from "express";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/auth.middlware.js";
// import {
//   createUser,
//   removeUser,
//   updateUser,
//   listUsers,
//   getUserById,
// } from "../controllers/user.controler.js";

const router = Router();

// router.post(
//   "/admin/create",
//   authMiddleware,
//   authorizeRoles("admin", "superAdmin"),
//   createUser
// );

// router.delete(
//   "/admin/remove/:userId",
//   authMiddleware,
//   authorizeRoles("admin", "superAdmin"),
//   removeUser
// );

// router.patch(
//   "/admin/update/:userId",
//   authMiddleware,
//   authorizeRoles("admin", "superAdmin"),
//   updateUser
// );

// router.get(
//   "/admin/get",
//   authMiddleware,
//   authorizeRoles("admin", "superAdmin"),
//   listUsers
// );

// router.get(
//   "/admin/get/:id",
//   authMiddleware,
//   authorizeRoles("admin", "superAdmin"),
//   getUserById
// );

export default router;
