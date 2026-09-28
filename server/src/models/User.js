import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, trim: true },
  name: { type: String, trim: true, default: "" },
  role: { type: String, enum: ["customer", "collector", "admin"], default: "customer" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
