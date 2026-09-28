import { Router } from "express";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ notifications });
});

router.post("/:id/read", async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification });
});

export default router;
