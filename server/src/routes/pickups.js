import { Router } from "express";
import Pickup from "../models/Pickup.js";
import Address from "../models/Address.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const filter = req.user.role === "customer" ? { customerId: req.user._id } :
    req.user.role === "collector" ? { collectorId: req.user._id } : {};
  const pickups = await Pickup.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ pickups });
});

router.post("/", auth, requireRole("customer"), async (req, res) => {
  const { addressId, items, scheduledDate, scheduledTime, customerLocation } = req.body;
  if (!addressId || !Array.isArray(items) || !items.length || !scheduledDate || !scheduledTime) {
    return res.status(400).json({ message: "addressId, items, scheduledDate and scheduledTime are required" });
  }
  const address = await Address.findOne({ _id: addressId, customerId: req.user._id });
  if (!address) return res.status(400).json({ message: "Invalid address" });
  const estimatedAmount = items.reduce((sum, item) => sum + Number(item.estimatedWeight || 0) * Number(item.rate || 0), 0);
  const pickup = await Pickup.create({
    customerId: req.user._id, addressId, items, scheduledDate, scheduledTime, customerLocation, estimatedAmount
  });
  res.status(201).json({ pickup });
});

router.post("/:id/cancel", auth, async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, customerId: req.user._id };
  const pickup = await Pickup.findOne(filter);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  if (["COMPLETED", "CANCELLED"].includes(pickup.status)) return res.status(400).json({ message: "Pickup cannot be cancelled" });
  pickup.status = "CANCELLED";
  await pickup.save();
  res.json({ pickup });
});

export default router;
