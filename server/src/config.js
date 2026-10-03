import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET || (isProduction ? "" : "dev-only-change-me");

if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
}

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scrap_mama",
  jwtSecret,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  otpMode: process.env.OTP_MODE || (isProduction ? "webhook" : "dev"),
  otpWebhookUrl: process.env.OTP_WEBHOOK_URL || "",
  otpWebhookToken: process.env.OTP_WEBHOOK_TOKEN || "",
  isProduction
};