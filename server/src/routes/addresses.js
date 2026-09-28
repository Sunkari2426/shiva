import { Router } from "express";
import Address from "../models/Address.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(auth, requireRole("customer"));

router.get("/", async (req, res) => res.json({ addresses: await Address.find({ customerId: req.user._id }).sort({ createdAt: -1 }) }));

router.post("/", async (req, res) => {
  const { label, line1, line2, city, state, postalCode, location } = req.body;
  if (!line1 || !city || !state) return res.status(400).json({ message: "line1, city and state are required" });
  const address = await Address.create({ customerId: req.user._id, label, line1, line2, city, state, postalCode, location });
  res.status(201).json({ address });
});

export default router;
