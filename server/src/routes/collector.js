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

router.get("/pickups", async (req, res) => {
  const pickups = await Pickup.find({ collectorId: req.user._id }).sort({ scheduledDate: -1 }).limit(100);
  res.json({ pickups });
});

router.post("/pickups/:id/accept", async (req, res) => {
  const pickup = await Pickup.findOneAndUpdate(
    { _id: req.params.id, status: { $in: ["PENDING", "ASSIGNED"] }, $or: [{ collectorId: { $exists: false } }, { collectorId: null }] },
    { collectorId: req.user._id, status: "ACCEPTED" },
    { new: true }
  );
  if (!pickup) return res.status(404).json({ message: "Pickup is no longer available" });
  res.json({ pickup });
});

router.post("/pickups/:id/status", async (req, res) => {
  const status = String(req.body.status || "");
  const transitions = {
    ACCEPTED: ["EN_ROUTE"],
    EN_ROUTE: ["ARRIVED"],
    ARRIVED: ["WEIGHING"],
    WEIGHING: ["PAYMENT_PENDING"],
    PAYMENT_PENDING: ["COMPLETED"]
  };
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  if (!transitions[pickup.status]?.includes(status)) {
    return res.status(400).json({ message: `Invalid transition from ${pickup.status} to ${status}` });
  }
  pickup.status = status;
  if (status === "COMPLETED") pickup.completedAt = new Date();
  await pickup.save();
  res.json({ pickup });
});

router.post("/pickups/:id/weigh", async (req, res) => {
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  if (!["WEIGHING", "ARRIVED"].includes(pickup.status)) return res.status(400).json({ message: "Pickup is not ready for weighing" });
  if (!Array.isArray(req.body.items) || !req.body.items.length) return res.status(400).json({ message: "items are required" });

  let finalAmount = 0;
  pickup.items = pickup.items.map(item => {
    const incoming = req.body.items.find(x => x.scrapType === item.scrapType);
    if (incoming) {
      item.actualWeight = Number(incoming.actualWeight || 0);
      if (incoming.rate !== undefined) item.rate = Number(incoming.rate || 0);
    }
    item.amount = Number(item.actualWeight || 0) * Number(item.rate || 0);
    finalAmount += item.amount;
    return item;
  });
  pickup.finalAmount = finalAmount;
  pickup.status = "PAYMENT_PENDING";
  await pickup.save();
  res.json({ pickup });
});

router.post("/pickups/:id/location", async (req, res) => {
  const lat = Number(req.body.lat), lng = Number(req.body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ message: "Valid lat/lng required" });
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id, status: { $in: ["EN_ROUTE", "ARRIVED"] } });
  if (!pickup) return res.status(404).json({ message: "Active pickup not found" });
  const location = await CollectorLocation.create({ collectorId: req.user._id, pickupId: pickup._id, lat, lng });
  req.app.get("io").to(String(pickup._id)).emit("collector:location", { pickupId: String(pickup._id), lat, lng, recordedAt: location.recordedAt });
  res.json({ location });
});

export default router;
