import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
export const validatePassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

export const comparePasswords = (password, hash) =>
  bcrypt.compare(password, hash);
export const hashPassword = (password) => bcrypt.hash(password, 10);

export const signAndSetToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};
