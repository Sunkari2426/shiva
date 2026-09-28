import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  pickupId: { type: mongoose.Schema.Types.ObjectId, ref: "Pickup", required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Rating", ratingSchema);
