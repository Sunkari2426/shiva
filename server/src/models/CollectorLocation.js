import mongoose from "mongoose";

const collectorLocationSchema = new mongoose.Schema({
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  pickupId: { type: mongoose.Schema.Types.ObjectId, ref: "Pickup", index: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now }
});

export default mongoose.model("CollectorLocation", collectorLocationSchema);
