import mongoose from "mongoose";

const scrapRateSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ScrapCategory", required: true },
  rate: { type: Number, required: true, min: 0 },
  effectiveFrom: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("ScrapRate", scrapRateSchema);
