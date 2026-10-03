import { Router } from "express";
import Pickup from "../models/Pickup.js";
import CollectorLocation from "../models/CollectorLocation.js";
import Notification from "../models/Notification.js";
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
  await Notification.create({
    userId: pickup.customerId,
    type: "PICKUP_ACCEPTED",
    title: "Partner accepted your pickup",
    message: `Pickup ${pickup._id} has been accepted by a partner.`,
    data: { pickupId: pickup._id }
  });
  res.json({ pickup });
});

router.post("/pickups/:id/status", async (req, res) => {
  const status = String(req.body.status || "");
  const transitions = {
    ACCEPTED: ["EN_ROUTE"],
    EN_ROUTE: ["ARRIVED"],
    ARRIVED: ["WEIGHING"],
    WEIGHING: ["PAYMENT_PENDING"]
  };
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  if (!transitions[pickup.status]?.includes(status)) {
    return res.status(400).json({ message: `Invalid transition from ${pickup.status} to ${status}` });
  }
  pickup.status = status;
  await pickup.save();
  const messages = {
    EN_ROUTE: ["Partner is on the way", `Your partner is on the way for pickup ${pickup._id}.`],
    ARRIVED: ["Partner arrived", `Your partner has arrived for pickup ${pickup._id}.`],
    WEIGHING: ["Scrap weighing started", `Weighing has started for pickup ${pickup._id}.`]
  };
  const [title, message] = messages[status] || ["Pickup updated", `Pickup ${pickup._id} is now ${status}.`];
  await Notification.create({
    userId: pickup.customerId,
    type: `PICKUP_${status}`,
    title,
    message,
    data: { pickupId: pickup._id, status }
  });
  res.json({ pickup });
});

router.post("/pickups/:id/weigh", async (req, res) => {
  const pickup = await Pickup.findOne({ _id: req.params.id, collectorId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  if (!["WEIGHING", "ARRIVED"].includes(pickup.status)) return res.status(400).json({ message: "Pickup is not ready for weighing" });
  if (!Array.isArray(req.body.items) || !req.body.items.length) return res.status(400).json({ message: "items are required" });
  if (req.body.items.length !== pickup.items.length) return res.status(400).json({ message: "All pickup items must be weighed" });

  const seen = new Set();
  let finalAmount = 0;
  for (const incoming of req.body.items) {
    const key = String(incoming.scrapType || "").trim().toLowerCase();
    if (!key || seen.has(key)) return res.status(400).json({ message: "Each scrap category must appear exactly once" });
    seen.add(key);
    const item = pickup.items.find(x => x.scrapType.toLowerCase() === key);
    if (!item) return res.status(400).json({ message: `Invalid scrap category: ${incoming.scrapType}` });
    const actualWeight = Number(incoming.actualWeight);
    if (!Number.isFinite(actualWeight) || actualWeight < 0) {
      return res.status(400).json({ message: `Invalid actual weight for ${item.scrapType}` });
    }
    item.actualWeight = actualWeight;
    item.amount = actualWeight * Number(item.rate || 0);
    finalAmount += item.amount;
  }
  pickup.finalAmount = finalAmount;
  pickup.status = "PAYMENT_PENDING";
  await pickup.save();
  await Notification.create({
    userId: pickup.customerId,
    type: "PAYMENT_PENDING",
    title: "Final amount ready",
    message: `Pickup ${pickup._id} is weighed. Final amount is ₹${finalAmount}.`,
    data: { pickupId: pickup._id, finalAmount }
  });
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
