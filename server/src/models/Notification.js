import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  readAt: Date,
  data: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
