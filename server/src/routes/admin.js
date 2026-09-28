import { Router } from "express";
import User from "../models/User.js";
import Pickup from "../models/Pickup.js";
import ScrapRate from "../models/ScrapRate.js";
import ScrapCategory from "../models/ScrapCategory.js";
import Payment from "../models/Payment.js";
import Complaint from "../models/Complaint.js";
import Rating from "../models/Rating.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(auth, requireRole("admin"));

router.get("/dashboard", async (_req, res) => {
  const [customers, collectors, pickups, completed, pending, cancelled] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "collector" }),
    Pickup.countDocuments(),
    Pickup.countDocuments({ status: "COMPLETED" }),
    Pickup.countDocuments({ status: { $nin: ["COMPLETED", "CANCELLED"] } }),
    Pickup.countDocuments({ status: "CANCELLED" })
  ]);
  const [revenue, scrap, openComplaints] = await Promise.all([
    Pickup.aggregate([{ $match: { status: "COMPLETED" } }, { $group: { _id: null, total: { $sum: "$finalAmount" } } }]),
    Pickup.aggregate([{ $unwind: "$items" }, { $group: { _id: null, total: { $sum: { $ifNull: ["$items.actualWeight", 0] } } } }]),
    Complaint.countDocuments({ status: { $in: ["OPEN", "IN_REVIEW"] } })
  ]);
  res.json({ customers, collectors, pickups, completed, pending, cancelled, revenue: revenue[0]?.total || 0, scrapKg: scrap[0]?.total || 0, openComplaints });
});

router.get("/pickups", async (_req, res) => {
  const pickups = await Pickup.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ pickups });
});

router.get("/users", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(200).select("-__v").lean();
  res.json({ users });
});

router.get("/rates", async (_req, res) => {
  const rates = await ScrapRate.find({ isActive: true }).populate("categoryId", "name unit").sort({ effectiveFrom: -1 }).lean();
  res.json({ rates });
});

router.patch("/rates/:id", async (req, res) => {
  const rate = Number(req.body.rate);
  if (!Number.isFinite(rate) || rate < 0) return res.status(400).json({ message: "Valid non-negative rate is required" });
  const updated = await ScrapRate.findByIdAndUpdate(req.params.id, { rate, effectiveFrom: new Date() }, { new: true }).populate("categoryId", "name unit");
  if (!updated) return res.status(404).json({ message: "Rate not found" });
  res.json({ rate: updated });
});

router.get("/payments", async (_req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ payments });
});

router.get("/complaints", async (_req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ complaints });
});

router.patch("/complaints/:id", async (req, res) => {
  const allowed = ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"];
  const status = String(req.body.status || "");
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid complaint status" });
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  res.json({ complaint });
});

router.get("/ratings", async (_req, res) => {
  const ratings = await Rating.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ ratings });
});

export default router;
