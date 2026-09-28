import { Router } from "express";
import User from "../models/User.js";
import Pickup from "../models/Pickup.js";
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
  const revenue = await Pickup.aggregate([{ $match: { status: "COMPLETED" } }, { $group: { _id: null, total: { $sum: "$finalAmount" } } }]);
  res.json({ customers, collectors, pickups, completed, pending, cancelled, revenue: revenue[0]?.total || 0 });
});

router.get("/pickups", async (_req, res) => res.json({ pickups: await Pickup.find().sort({ createdAt: -1 }).limit(200) }));
router.get("/users", async (_req, res) => res.json({ users: await User.find().sort({ createdAt: -1 }).limit(200) }));

export default router;
