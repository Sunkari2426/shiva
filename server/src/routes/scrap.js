import { Router } from "express";
import ScrapCategory from "../models/ScrapCategory.js";
import ScrapRate from "../models/ScrapRate.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/categories", async (_req, res) => {
  const categories = await ScrapCategory.find({ isActive: true }).sort({ name: 1 });
  const rates = await ScrapRate.find({ isActive: true }).sort({ effectiveFrom: -1 });
  const latest = new Map();
  for (const rate of rates) if (!latest.has(String(rate.categoryId))) latest.set(String(rate.categoryId), rate);
  res.json({ categories: categories.map(c => ({ ...c.toObject(), rate: latest.get(String(c._id))?.rate ?? 0 })) });
});

router.post("/categories", auth, requireRole("admin"), async (req, res) => {
  const category = await ScrapCategory.create({ name: req.body.name, unit: req.body.unit || "kg" });
  res.status(201).json({ category });
});

router.post("/rates", auth, requireRole("admin"), async (req, res) => {
  const rate = await ScrapRate.create({ categoryId: req.body.categoryId, rate: Number(req.body.rate) });
  res.status(201).json({ rate });
});

export default router;
