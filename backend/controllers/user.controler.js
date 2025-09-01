import User from "../models/user.model.js";
import {
  validateEmail,
  validatePassword,
  comparePasswords,
  hashPassword,
} from "../utils/authUtils.js";

/**
Permissions:
admin  -> can manage mentors in their own institute.
superAdmin -> can manage admins & mentors (any institute).
*/
const canActOn = (actor, target) => {
  if (actor.role === "admin") {
    if (["admin", "superAdmin"].includes(target.role)) return false;
    if (!actor.instituteId || !target.instituteId) return false;
    return actor.instituteId === target.instituteId.toString();
  }
  if (actor.role === "superAdmin") {
    if (target.role === "superAdmin") return false;
    return true;
  }
  return false;
};

export const createUser = async (req, res) => {
  const { name, email, password, role, department, instituteId } =
    req.body || {};

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      error: "name, email, password, role are required",
    });
  }
  if (!validateEmail(email) || !validatePassword(password)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email or password" });
  }

  const normalizedRole = role.trim();
  if (req.user.role === "admin" && normalizedRole !== "mentor") {
    return res
      .status(403)
      .json({ success: false, error: "Admins can only create mentors" });
  }
  if (
    req.user.role === "superAdmin" &&
    !["admin", "mentor"].includes(normalizedRole)
  ) {
    return res.status(403).json({
      success: false,
      error: "SuperAdmin can create only admin or mentor",
    });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });

    const hashed = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      hashedPassword: hashed,
      role: normalizedRole,
      department: department || undefined,
      instituteId:
        req.user.role === "admin" ? req.user.instituteId : instituteId || null,
    });

    const safe = newUser.toObject();
    delete safe.hashedPassword;

    return res
      .status(201)
      .json({ success: true, message: "User created", data: safe });
  } catch (err) {
    console.error("Error creating user:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const removeUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId)
    return res
      .status(400)
      .json({ success: false, error: "userId is required" });

  try {
    const target = await User.findById(userId);
    if (!target)
      return res.status(404).json({ success: false, error: "User not found" });

    if (!canActOn(req.user, target)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: insufficient permissions" });
    }

    await User.findByIdAndDelete(userId);

    const safe = target.toObject();
    delete safe.hashedPassword;

    return res
      .status(200)
      .json({ success: true, message: "User deleted", data: safe });
  } catch (err) {
    console.error("Error removing user:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password, newPassword, department } = req.body || {};
  if (!userId)
    return res
      .status(400)
      .json({ success: false, error: "userId is required" });

  if (!name && !email && !password && !newPassword && !department) {
    return res
      .status(400)
      .json({ success: false, error: "No fields provided to update" });
  }

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    if (!canActOn(req.user, user)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: insufficient permissions" });
    }

    if (email) {
      if (!validateEmail(email))
        return res.status(400).json({ success: false, error: "Invalid email" });
      const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
      if (emailTaken)
        return res
          .status(409)
          .json({ success: false, error: "Email already in use" });
      user.email = email;
    }

    if ((password && !newPassword) || (!password && newPassword)) {
      return res.status(400).json({
        success: false,
        error:
          "Provide both current password and newPassword to change password",
      });
    }
    if (password && newPassword) {
      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          success: false,
          error: "New password does not meet requirements",
        });
      }
      const correct = await comparePasswords(password, user.hashedPassword);
      if (!correct)
        return res
          .status(401)
          .json({ success: false, error: "Current password incorrect" });
      user.hashedPassword = await hashPassword(newPassword);
    }

    if (name) user.name = name;
    if (department) user.department = department;

    await user.save();

    const safe = user.toObject();
    delete safe.hashedPassword;

    return res
      .status(200)
      .json({ success: true, message: "User updated", data: safe });
  } catch (err) {
    console.error("Error updating user:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === "admin") {
      query.instituteId = req.user.instituteId || null;
      query.role = "mentor";
    }
    const users = await User.find(query).select("-hashedPassword");
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("Error listing users:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-hashedPassword");
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    if (!canActOn(req.user, user) && req.user.userId !== id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("Error getting user:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
