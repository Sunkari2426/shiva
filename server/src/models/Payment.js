import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  pickupId: { type: mongoose.Schema.Types.ObjectId, ref: "Pickup", required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["CASH", "UPI", "GATEWAY"], default: "CASH" },
  status: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
  transactionId: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
