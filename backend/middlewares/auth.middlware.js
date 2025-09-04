import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized: token missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(payload.userId).select(
      "_id role instituteId activeStatus"
    );
    if (!user || user.activeStatus === false) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: user not found or inactive",
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      instituteId: user.instituteId ? user.instituteId.toString() : null,
    };

    next();
  } catch (err) {
    const isExpired = err?.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      error: isExpired
        ? "Unauthorized: token expired"
        : "Unauthorized: invalid token",
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        error: "authMiddleware must run before authorizeRoles",
      });
    }
    if (!allowedRoles[0].includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: insufficient permissions" });
    }
    next();
  };
};
