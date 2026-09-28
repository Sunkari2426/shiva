import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  pickupId: { type: mongoose.Schema.Types.ObjectId, ref: "Pickup" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"], default: "OPEN" }
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);
