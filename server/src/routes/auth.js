import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";

const router = Router();
const pendingOtps = new Map();
const attempts = new Map();

function normalizePhone(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function validPhone(phone) {
  return /^\+?[1-9]\d{9,14}$/.test(phone);
}

function allowAttempt(key, limit, windowMs) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  attempts.set(key, recent);
  return true;
}

router.post("/request-otp", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!validPhone(phone)) return res.status(400).json({ message: "Enter a valid mobile number" });
  if (!allowAttempt(`send:${phone}`, 5, 10 * 60 * 1000)) return res.status(429).json({ message: "Too many OTP requests. Try again later." });
  const otp = config.otpMode === "dev" ? "123456" : String(Math.floor(100000 + Math.random() * 900000));
  pendingOtps.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
  res.json({ message: "OTP sent", devOtp: config.otpMode === "dev" ? otp : undefined });
});

router.post("/verify-otp", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || "").trim();
  if (!validPhone(phone) || !/^\d{6}$/.test(otp)) return res.status(400).json({ message: "Invalid phone or OTP" });
  if (!allowAttempt(`verify:${phone}`, 10, 10 * 60 * 1000)) return res.status(429).json({ message: "Too many verification attempts. Try again later." });
  const record = pendingOtps.get(phone);
  if (!record || record.expiresAt < Date.now() || record.otp !== otp || record.attempts >= 5) {
    if (record) record.attempts += 1;
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  pendingOtps.delete(phone);
  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone, role: "customer" });
  if (user.isActive === false) return res.status(403).json({ message: "Account is inactive" });
  const token = jwt.sign({ userId: user._id.toString(), role: user.role }, config.jwtSecret, { expiresIn: "2h" });
  res.json({ token, user: { id: user._id, phone: user.phone, name: user.name, role: user.role } });
});

export default router;
