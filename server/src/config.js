import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scrap_mama",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  otpMode: process.env.OTP_MODE || "dev"
};
