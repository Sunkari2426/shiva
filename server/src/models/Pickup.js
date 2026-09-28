import mongoose from "mongoose";

const pickupItemSchema = new mongoose.Schema({
  scrapType: { type: String, required: true },
  estimatedWeight: { type: Number, min: 0, default: 0 },
  actualWeight: { type: Number, min: 0, default: 0 },
  rate: { type: Number, min: 0, default: 0 },
  amount: { type: Number, min: 0, default: 0 }
}, { _id: false });

const pickupSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
  items: { type: [pickupItemSchema], validate: v => v.length > 0 },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  status: {
    type: String,
    enum: ["PENDING", "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "WEIGHING", "PAYMENT_PENDING", "COMPLETED", "CANCELLED"],
    default: "PENDING"
  },
  estimatedAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
  customerLocation: { lat: Number, lng: Number },
  completedAt: Date
}, { timestamps: true });

export default mongoose.model("Pickup", pickupSchema);
