import jwt from "jsonwebtoken";
import { config } from "../config.js";
import User from "../models/User.js";

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) return res.status(401).json({ message: "User not found or inactive" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
