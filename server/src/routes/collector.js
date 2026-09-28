import { Router } from "express";
import Pickup from "../models/Pickup.js";
import CollectorLocation from "../models/CollectorLocation.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(auth, requireRole("collector"));

router.get("/requests", async (req, res) => {
  const pickups = await Pickup.find({ status: { $in: ["PENDING", "ASSIGNED"] } }).sort({ scheduledDate: 1 }).limit(100);
  res.json({ pickups });
});

router.post("/pickups/:id/accept", async (req, res) => {
  const pickup = await Pickup.findOne({ _id: req.params.id, status: { $in: ["PENDING", "ASSIGNED"] } });
  if (!pickup) return res.status(404).json({ message: "Pickup is no longer available" });
  pickup.collectorId = req.user._id;
  pickup.status = "ACCEPTED";
  await pickup.save();
  res.json({ pickup });
});

router.post("/pickups/:id/status", async (req, res) => {
  const allowed = ["EN_ROUTE", "ARRIVED", "WEIGHING", "PAYMENT_PENDING", "COMPLETED"];
  const status = String(req.body.status || "");
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  pickup.status = status;
  if (status === "COMPLETED") pickup.completedAt = new Date();
  await pickup.save();
  res.json({ pickup });
});

router.post("/pickups/:id/location", async (req, res) => {
  const { lat, lng } = req.body;
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  const location = await CollectorLocation.create({ collectorId: req.user._id, pickupId: pickup._id, lat, lng });
  req.app.get("io").to(String(pickup._id)).emit("collector:location", { pickupId: pickup._id, lat, lng });
  res.json({ location });
});

export default router;
