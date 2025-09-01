import User from "../models/user.model.js";
import {
  validateEmail,
  validatePassword,
  comparePasswords,
  hashPassword,
  signAndSetToken,
} from "../utils/authUtils.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });
    if (user.activeStatus === false) {
      return res
        .status(403)
        .json({ success: false, error: "Account is inactive" });
    }

    const ok = await comparePasswords(password, user.hashedPassword);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });

    const token = signAndSetToken(res, {
      userId: user._id,
      instituteId: user.instituteId || null,
      role: user.role,
    });

    const safe = user.toObject();
    delete safe.hashedPassword;

    return res
      .status(200)
      .json({ success: true, message: "Logged in", data: safe, token });
  } catch (err) {
    console.error("Error during login:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Name, email, and password are required",
    });
  }
  if (!validateEmail(email) || !validatePassword(password)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email or password" });
  }

  try {
    const existingSA = await User.findOne({ role: "superAdmin" });
    if (existingSA) {
      return res
        .status(409)
        .json({ success: false, error: "SuperAdmin already exists" });
    }

    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return res
        .status(409)
        .json({ success: false, error: "Email already in use" });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      hashedPassword: hashed,
      role: "superAdmin",
    });

    const token = signAndSetToken(res, {
      userId: user._id,
      instituteId: null,
      role: "superAdmin",
    });

    const safe = user.toObject();
    delete safe.hashedPassword;

    return res.status(201).json({
      success: true,
      message: "SuperAdmin registered",
      data: safe,
      token,
    });
  } catch (err) {
    console.error("Error registering super admin:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const getUser = async (req, res) => {
  const { user } = req;

  if (!user)
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized access" });

  const currUser = await User.findById(user.userId).select("-password");

  return res.status(200).json({
    success: true,
    message: "User details fetched successfully",
    data: currUser,
  });
};
