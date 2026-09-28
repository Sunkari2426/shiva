import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";

const router = Router();
const pendingOtps = new Map();

router.post("/request-otp", async (req, res) => {
  const phone = String(req.body.phone || "").trim();
  if (!phone) return res.status(400).json({ message: "Phone is required" });
  const otp = "123456";
  pendingOtps.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  res.json({ message: "OTP generated", devOtp: config.otpMode === "dev" ? otp : undefined });
});

router.post("/verify-otp", async (req, res) => {
  const phone = String(req.body.phone || "").trim();
  const otp = String(req.body.otp || "").trim();
  const record = pendingOtps.get(phone);
  if (!record || record.expiresAt < Date.now() || record.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  pendingOtps.delete(phone);
  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone, role: "customer" });
  const token = jwt.sign({ userId: user._id.toString(), role: user.role }, config.jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, phone: user.phone, name: user.name, role: user.role } });
});

export default router;
