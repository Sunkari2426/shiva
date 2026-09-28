import { Router } from "express";
import Pickup from "../models/Pickup.js";
import Payment from "../models/Payment.js";
import Address from "../models/Address.js";
import { auth, requireRole } from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import Rating from "../models/Rating.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const filter = req.user.role === "customer" ? { customerId: req.user._id } :
    req.user.role === "collector" ? { collectorId: req.user._id } : {};
  const pickups = await Pickup.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ pickups });
});

router.get("/:id", auth, async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } :
    req.user.role === "collector" ? { _id: req.params.id, collectorId: req.user._id } :
    { _id: req.params.id, customerId: req.user._id };
  const pickup = await Pickup.findOne(filter);
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  const payment = await Payment.findOne({ pickupId: pickup._id }).sort({ createdAt: -1 });
  res.json({ pickup, payment });
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
  await Notification.create({ userId: req.user._id, type: "PICKUP_CREATED", title: "Pickup booked", message: `Your pickup ${pickup._id} has been booked.`, data: { pickupId: pickup._id } });
  res.status(201).json({ pickup });
});

router.post("/:id/payment", auth, async (req, res) => {
  const pickup = await Pickup.findOne({ _id: req.params.id, customerId: req.user._id });
  if (!pickup) return res.status(404).json({ message: "Pickup not found" });
  if (pickup.status !== "PAYMENT_PENDING") return res.status(400).json({ message: "Payment is not pending" });
  const method = ["CASH", "UPI", "GATEWAY"].includes(req.body.method) ? req.body.method : "CASH";
  const payment = await Payment.findOneAndUpdate(
    { pickupId: pickup._id },
    { pickupId: pickup._id, amount: pickup.finalAmount, method, status: "PAID", transactionId: String(req.body.transactionId || "") },
    { upsert: true, new: true }
  );
  pickup.paymentStatus = "PAID";
  pickup.status = "COMPLETED";
  pickup.completedAt = new Date();
  await pickup.save();
  await Notification.create({ userId: req.user._id, type: "PICKUP_COMPLETED", title: "Pickup completed", message: `Pickup ${pickup._id} completed. Final amount ₹${pickup.finalAmount}.`, data: { pickupId: pickup._id, finalAmount: pickup.finalAmount } });
  if (req.app.get("io")) req.app.get("io").to(String(pickup._id)).emit("pickup:completed", { pickupId: String(pickup._id), finalAmount: pickup.finalAmount });
  res.json({ pickup, payment });
});

router.post("/:id/rating", auth, requireRole("customer"), async (req, res) => {
  const pickup = await Pickup.findOne({ _id: req.params.id, customerId: req.user._id, status: "COMPLETED" });
  if (!pickup || !pickup.collectorId) return res.status(400).json({ message: "Completed pickup with collector is required" });
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be an integer from 1 to 5" });
  const result = await Rating.findOneAndUpdate(
    { pickupId: pickup._id },
    { pickupId: pickup._id, customerId: req.user._id, collectorId: pickup.collectorId, rating, comment: String(req.body.comment || "").slice(0, 500) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ rating: result });
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
